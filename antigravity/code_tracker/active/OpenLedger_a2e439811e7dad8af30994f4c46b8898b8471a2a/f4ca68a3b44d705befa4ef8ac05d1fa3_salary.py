çfrom sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, UniqueConstraint, JSON
from sqlalchemy.orm import relationship
from .transaction import Base
import datetime

class Salary(Base):
    __tablename__ = "salaries"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)
    month_reference = Column(String(50))
    employer = Column(String(255))
    employee_name = Column(String(255))
    employee_id = Column(String(50))
    contract_hours = Column(Float)
    
    # Financial Summaries
    net_income = Column(Float, nullable=False)
    total_earnings = Column(Float) # Tot. Competenze
    total_deductions = Column(Float) # Tot. Trattenute
    gross_taxable = Column(Float) # Imponibile Fiscale
    
    # Metadata
    filename = Column(String(255))
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    raw_data = Column(JSON)

    # Relationships
    items = relationship("SalaryItem", back_populates="salary", cascade="all, delete-orphan")
    leaves = relationship("SalaryLeave", back_populates="salary", cascade="all, delete-orphan")
    fiscal_data = relationship("FiscalData", back_populates="salary", uselist=False, cascade="all, delete-orphan")
    attendance = relationship("Attendance", back_populates="salary", cascade="all, delete-orphan")

class SalaryItem(Base):
    __tablename__ = "salary_items"

    id = Column(Integer, primary_key=True, index=True)
    salary_id = Column(Integer, ForeignKey("salaries.id"))
    
    code = Column(String(20))
    description = Column(String(255))
    quantity = Column(Float)
    base_data = Column(Float)
    earnings = Column(Float) # Competenze
    deductions = Column(Float) # Trattenute
    type = Column(String(20)) # 'Earning' or 'Deduction'
    details = Column(String(255)) # Extra info/flags

    salary = relationship("Salary", back_populates="items")

class SalaryLeave(Base):
    __tablename__ = "salary_leaves"

    id = Column(Integer, primary_key=True, index=True)
    salary_id = Column(Integer, ForeignKey("salaries.id"))
    
    leave_type = Column(String(50)) # Ferie, ROL, Banca Ore
    previous_residue = Column(Float) # Res. A.P.
    accrued = Column(Float) # Mat. Anno
    used = Column(Float) # Goduto
    remaining = Column(Float) # Residuo

    salary = relationship("Salary", back_populates="leaves")

class FiscalData(Base):
    __tablename__ = "fiscal_data"

    id = Column(Integer, primary_key=True, index=True)
    salary_id = Column(Integer, ForeignKey("salaries.id"))
    
    taxable_income = Column(Float)  # Imp.Fisc
    gross_tax = Column(Float)       # Imposta Lorda
    net_tax = Column(Float)         # Imposta Netta
    tfr_month = Column(Float)       # TFR Mese
    tfr_fund = Column(Float)        # Q.TFR Fdo

    salary = relationship("Salary", back_populates="fiscal_data")

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    salary_id = Column(Integer, ForeignKey("salaries.id"))
    
    date = Column(Date)            # 01.10.2025
    entry_time = Column(String(10))      # 08:00:00
    exit_time = Column(String(10))       # 17:00:00

    salary = relationship("Salary", back_populates="attendance")ç*cascade08"(a2e439811e7dad8af30994f4c46b8898b8471a2a2Ofile:///c:/Users/Admin/Documents/Coding/OpenLedger/backend/app/models/salary.py:2file:///c:/Users/Admin/Documents/Coding/OpenLedger