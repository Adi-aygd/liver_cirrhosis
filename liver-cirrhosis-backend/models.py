from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class FirstReportInput(BaseModel):
    Age: float
    Sex: str
    Albumin: float
    Bilirubin: float
    ALT: float
    AST: float
    ALP: float
    INR: float
    Platelets: float
    Sodium: float
    Creatinine: float
    Ascites: int
    Hepatomegaly: int
    Spiders: int
    Edema: int

class FollowupReportInput(FirstReportInput):
    previous_stage: int
    bed_rest: int
    drugs: int


# Patient Models
class Patient(BaseModel):
    name: str
    username: str
    age: int
    gender: str
    contact: str

class PatientInDB(Patient):
    id: Optional[str] = Field(alias="_id")

# Doctor Models
class Doctor(BaseModel):
    name: str
    hospital: str
    rating: float
    timing: str
    status: str  # e.g., "Available", "Unavailable"

class DoctorInDB(Doctor):
    id: Optional[str] = Field(alias="_id")

class Appointment(BaseModel):
    patientId: str
    doctorId: str
    date: str  # You can use str for now, or datetime if you want stricter validation
    status: str  # e.g., "Booked", "Completed"
    prescribed: bool = False
    nextDate: Optional[str] = None

class AppointmentInDB(Appointment):
    id: Optional[str] = Field(alias="_id")

class LabReport(BaseModel):
    patientId: str
    doctorId: str
    age: int
    sex: str
    albumin: float
    bilirubin: float
    alt: float
    ast: float
    alp: float
    inr: float
    platelets: float
    sodium: float
    creatinine: float
    ascites: str
    hepatomegaly: str
    spiders: str
    edema: str
    # For subsequent reports:
    stage: Optional[str] = None
    bedrest: Optional[str] = None
    drugs: Optional[str] = None
    prescription: Optional[str] = None
    precautions: Optional[str] = None
    nextDate: Optional[str] = None
    createdAt: Optional[str] = None  # You can set this on creation

class LabReportInDB(LabReport):
    id: Optional[str] = Field(alias="_id")


class User(BaseModel):
    username: str
    password: str
    role: str  # "patient", "doctor", "lab", "admin"
    name: Optional[str] = None

class UserInDB(User):
    id: Optional[str] = Field(alias="_id")
