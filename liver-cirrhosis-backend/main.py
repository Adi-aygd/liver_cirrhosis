from fastapi import FastAPI, HTTPException, status, Depends
from database import db
from auth import (
    hash_password, verify_password, create_access_token, RoleChecker, get_current_user
)
from fastapi.security import OAuth2PasswordRequestForm

from models import (
    Patient, PatientInDB, Doctor, DoctorInDB,
    Appointment, AppointmentInDB, LabReport, LabReportInDB,
    User, UserInDB, FirstReportInput, FollowupReportInput
)
from datetime import datetime, timedelta

from ml_model import predict_first_report, predict_followup_report

app = FastAPI()
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; restrict in production!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Liver Cirrhosis Backend is running!"}

# ------------------ User-specific filtering endpoints ------------------

@app.get("/patients/me", response_model=PatientInDB, dependencies=[Depends(RoleChecker(["patient"]))])
async def get_my_patient(current_user: User = Depends(get_current_user)):
    patient = await db.patients.find_one({"username": current_user.username})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    patient["_id"] = str(patient["_id"])
    return patient

@app.get("/labreports/me", response_model=list[LabReportInDB], dependencies=[Depends(RoleChecker(["patient"]))])
async def get_my_labreports(current_user: User = Depends(get_current_user)):
    reports = []
    async for report in db.labreports.find({"patientId": current_user.username}):
        report["_id"] = str(report["_id"])
        reports.append(report)
    return reports

@app.get("/patients/my", response_model=list[PatientInDB], dependencies=[Depends(RoleChecker(["doctor"]))])
async def get_my_patients(current_user: User = Depends(get_current_user)):
    patients = []
    async for patient in db.patients.find({"doctorId": current_user.username}):
        patient["_id"] = str(patient["_id"])
        patients.append(patient)
    return patients

@app.get("/labreports/my", response_model=list[LabReportInDB], dependencies=[Depends(RoleChecker(["lab"]))])
async def get_my_labreports_lab(current_user: User = Depends(get_current_user)):
    reports = []
    async for report in db.labreports.find({"createdBy": current_user.username}):
        report["_id"] = str(report["_id"])
        reports.append(report)
    return reports

@app.get("/appointments/me", response_model=list[AppointmentInDB], dependencies=[Depends(RoleChecker(["patient"]))])
async def get_my_appointments(current_user: User = Depends(get_current_user)):
    appointments = []
    async for appt in db.appointments.find({"patientId": current_user.username}):
        appt["_id"] = str(appt["_id"])
        appointments.append(appt)
    return appointments

@app.get("/appointments/my", response_model=list[AppointmentInDB], dependencies=[Depends(RoleChecker(["doctor"]))])
async def get_my_appointments_doctor(current_user: User = Depends(get_current_user)):
    appointments = []
    async for appt in db.appointments.find({"doctorId": current_user.username}):
        appt["_id"] = str(appt["_id"])
        appointments.append(appt)
    return appointments

# ------------------ Original endpoints with RBAC ------------------

@app.get("/patients", response_model=list[PatientInDB], dependencies=[Depends(RoleChecker(["doctor", "admin", "lab", "patient"]))])
async def get_patients():
    patients = []
    async for patient in db.patients.find():
        patient["_id"] = str(patient["_id"])
        patients.append(patient)
    return patients

@app.post("/patients", response_model=PatientInDB)
async def create_patient(patient: Patient):
    patient_dict = patient.dict()
    result = await db.patients.insert_one(patient_dict)
    patient_dict["_id"] = str(result.inserted_id)
    return patient_dict

@app.get("/doctors", response_model=list[DoctorInDB], dependencies=[Depends(RoleChecker(["admin", "lab"]))])
async def get_doctors():
    doctors = []
    async for doctor in db.doctors.find():
        doctor["_id"] = str(doctor["_id"])
        doctors.append(doctor)
    return doctors

@app.post("/doctors", response_model=DoctorInDB, dependencies=[Depends(RoleChecker(["admin"]))])
async def create_doctor(doctor: Doctor):
    doctor_dict = doctor.dict()
    result = await db.doctors.insert_one(doctor_dict)
    doctor_dict["_id"] = str(result.inserted_id)
    return doctor_dict

@app.get("/appointments", response_model=list[AppointmentInDB], dependencies=[Depends(RoleChecker(["admin", "doctor", "lab"]))])
async def get_appointments():
    appointments = []
    async for appt in db.appointments.find():
        appt["_id"] = str(appt["_id"])
        appointments.append(appt)
    return appointments

@app.post("/appointments", response_model=AppointmentInDB, dependencies=[Depends(RoleChecker(["admin", "doctor"]))])
async def create_appointment(appt: Appointment):
    appt_dict = appt.dict()
    result = await db.appointments.insert_one(appt_dict)
    appt_dict["_id"] = str(result.inserted_id)
    return appt_dict

@app.get("/labreports", response_model=list[LabReportInDB], dependencies=[Depends(RoleChecker(["doctor", "admin"]))])
async def get_labreports():
    reports = []
    async for report in db.labreports.find():
        report["_id"] = str(report["_id"])
        reports.append(report)
    return reports

@app.post("/labreports", response_model=LabReportInDB, dependencies=[Depends(RoleChecker(["lab", "admin"]))])
async def create_labreport(report: LabReport, current_user: User = Depends(get_current_user)):
    report_dict = report.dict()
    report_dict["createdAt"] = datetime.utcnow().isoformat()
    if current_user.role == "lab":
        report_dict["createdBy"] = current_user.username
    result = await db.labreports.insert_one(report_dict)
    report_dict["_id"] = str(result.inserted_id)
    return report_dict

# ------------------ Auth endpoints ------------------

@app.post("/register", response_model=UserInDB)
async def register(user: User):
    user_dict = user.dict()
    user_dict["password"] = hash_password(user.password)
    result = await db.users.insert_one(user_dict)
    user_dict["_id"] = str(result.inserted_id)
    return user_dict

@app.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db_user = await db.users.find_one({"username": form_data.username})
    if not db_user or not verify_password(form_data.password, db_user["password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    access_token = create_access_token(
        data={"sub": db_user["username"], "role": db_user["role"]},
        expires_delta=timedelta(minutes=60)
    )
    return {"access_token": access_token, "token_type": "bearer"}

# ------------------ Test endpoint ------------------

@app.get("/protected-test")
async def protected_test(current_user: User = Depends(get_current_user)):
    return {"message": f"Hello, {current_user.username}! You are authenticated as {current_user.role}."}

# ------------------ ML Prediction Endpoints ------------------

@app.post("/predict/first")
async def predict_first(data: FirstReportInput):
    return predict_first_report(data.dict())

@app.post("/predict/followup")
async def predict_followup(data: FollowupReportInput):
    return predict_followup_report(data.dict())
