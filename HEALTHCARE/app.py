"""
Premium Healthcare Management System — Flask REST API Backend
Serves the frontend and provides all CRUD API endpoints.
Run: python app.py
Access: http://localhost:5000
"""

import json
import os
import shutil
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# ========================== APP SETUP ==========================

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
os.makedirs(DATA_DIR, exist_ok=True)


# ========================== DATA HELPERS ==========================

def load_json(filename):
    filepath = os.path.join(DATA_DIR, filename)
    if not os.path.exists(filepath):
        return []
    with open(filepath, 'r') as f:
        return json.load(f)


def save_json(filename, data):
    filepath = os.path.join(DATA_DIR, filename)
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2)


def generate_id(prefix, items):
    if not items:
        return f"{prefix}1001"
    max_num = max(int(item['id'].replace(prefix, '')) for item in items)
    return f"{prefix}{max_num + 1}"


# ========================== SEED DATA ==========================

def seed_data():
    """Initialize with sample data if empty."""
    if not load_json('patients.json'):
        save_json('patients.json', [
            {"id": "P1001", "name": "John Doe", "age": 35, "gender": "Male", "contact": "+1 555-0101", "address": "123 Main St", "medicalHistory": "Hypertension"},
            {"id": "P1002", "name": "Jane Smith", "age": 28, "gender": "Female", "contact": "+1 555-0102", "address": "456 Oak Ave", "medicalHistory": "None"},
            {"id": "P1003", "name": "Robert Johnson", "age": 52, "gender": "Male", "contact": "+1 555-0103", "address": "789 Pine Rd", "medicalHistory": "Diabetes Type 2"},
            {"id": "P1004", "name": "Maria Garcia", "age": 45, "gender": "Female", "contact": "+1 555-0104", "address": "321 Elm St", "medicalHistory": "Asthma"},
            {"id": "P1005", "name": "David Lee", "age": 61, "gender": "Male", "contact": "+1 555-0105", "address": "555 Cedar Ln", "medicalHistory": "Arthritis, High Cholesterol"},
            {"id": "P1006", "name": "Emily Watson", "age": 34, "gender": "Female", "contact": "+1 555-0106", "address": "707 Maple Dr", "medicalHistory": "Migraines"},
            {"id": "P1007", "name": "Michael Chang", "age": 45, "gender": "Male", "contact": "+1 555-0107", "address": "808 Cherry Ln", "medicalHistory": "GERD"},
            {"id": "P1008", "name": "Sarah Al-Jamil", "age": 29, "gender": "Female", "contact": "+1 555-0108", "address": "909 Walnut St", "medicalHistory": "None"},
            {"id": "P1009", "name": "William Davies", "age": 68, "gender": "Male", "contact": "+1 555-0109", "address": "111 Birch Rd", "medicalHistory": "Chronic Kidney Disease, Stage 2"},
            {"id": "P1010", "name": "Olivia Taylor", "age": 41, "gender": "Female", "contact": "+1 555-0110", "address": "222 Spruce St", "medicalHistory": "Hypothyroidism"},
            {"id": "P1011", "name": "James Anderson", "age": 50, "gender": "Male", "contact": "+1 555-0111", "address": "333 Ash Blvd", "medicalHistory": "Hyperlipidemia"},
            {"id": "P1012", "name": "Sophia Kelly", "age": 19, "gender": "Female", "contact": "+1 555-0112", "address": "444 Pine St", "medicalHistory": "Allergic Rhinitis"},
            {"id": "P1013", "name": "Alexander Wright", "age": 38, "gender": "Male", "contact": "+1 555-0113", "address": "555 Cedar St", "medicalHistory": "Asthma"},
            {"id": "P1014", "name": "Isabella Martinez", "age": 27, "gender": "Female", "contact": "+1 555-0114", "address": "666 Willow Ave", "medicalHistory": "None"},
            {"id": "P1015", "name": "Benjamin Thomas", "age": 55, "gender": "Male", "contact": "+1 555-0115", "address": "777 Poplar Dr", "medicalHistory": "Type 2 Diabetes"},
            {"id": "P1016", "name": "Mia Robinson", "age": 31, "gender": "Female", "contact": "+1 555-0116", "address": "888 Alder Rd", "medicalHistory": "Eczema"},
            {"id": "P1017", "name": "Lucas Garcia", "age": 47, "gender": "Male", "contact": "+1 555-0117", "address": "999 Larch Ln", "medicalHistory": "Gout"},
            {"id": "P1018", "name": "Charlotte Clark", "age": 62, "gender": "Female", "contact": "+1 555-0118", "address": "124 Oak St", "medicalHistory": "Osteoarthritis"},
            {"id": "P1019", "name": "Henry Rodriguez", "age": 59, "gender": "Male", "contact": "+1 555-0119", "address": "235 Pine Ave", "medicalHistory": "Hypertension"},
            {"id": "P1020", "name": "Amelia Lewis", "age": 24, "gender": "Female", "contact": "+1 555-0120", "address": "346 Elm St", "medicalHistory": "None"},
            {"id": "P1021", "name": "Mason Lee", "age": 33, "gender": "Male", "contact": "+1 555-0121", "address": "457 Cedar Ln", "medicalHistory": "Insomnia"},
            {"id": "P1022", "name": "Harper Walker", "age": 29, "gender": "Female", "contact": "+1 555-0122", "address": "568 Maple Rd", "medicalHistory": "Anxiety"},
            {"id": "P1023", "name": "Ethan Hall", "age": 43, "gender": "Male", "contact": "+1 555-0123", "address": "679 Spruce Ave", "medicalHistory": "Sleep Apnea"},
            {"id": "P1024", "name": "Evelyn Allen", "age": 51, "gender": "Female", "contact": "+1 555-0124", "address": "780 Birch Blvd", "medicalHistory": "High Cholesterol"},
            {"id": "P1025", "name": "Logan Young", "age": 36, "gender": "Male", "contact": "+1 555-0125", "address": "891 Cherry Dr", "medicalHistory": "None"},
            {"id": "P1026", "name": "Abigail Hernandez", "age": 48, "gender": "Female", "contact": "+1 555-0126", "address": "902 Walnut Ave", "medicalHistory": "Irritable Bowel Syndrome"},
            {"id": "P1027", "name": "Daniel King", "age": 54, "gender": "Male", "contact": "+1 555-0127", "address": "135 Spruce St", "medicalHistory": "Hypertension, GERD"},
            {"id": "P1028", "name": "Emily Wright", "age": 30, "gender": "Female", "contact": "+1 555-0128", "address": "246 Alder Ave", "medicalHistory": "None"},
            {"id": "P1029", "name": "Matthew Lopez", "age": 40, "gender": "Male", "contact": "+1 555-0129", "address": "357 Larch Rd", "medicalHistory": "Allergy to Penicillin"},
            {"id": "P1030", "name": "Elizabeth Hill", "age": 65, "gender": "Female", "contact": "+1 555-0130", "address": "468 Pine Blvd", "medicalHistory": "Osteoporosis"},
            {"id": "P1031", "name": "Jackson Scott", "age": 28, "gender": "Male", "contact": "+1 555-0131", "address": "579 Oak Dr", "medicalHistory": "None"},
            {"id": "P1032", "name": "Sofia Green", "age": 37, "gender": "Female", "contact": "+1 555-0132", "address": "680 Maple Ln", "medicalHistory": "Hypothyroidism"},
            {"id": "P1033", "name": "David Adams", "age": 72, "gender": "Male", "contact": "+1 555-0133", "address": "791 Cedar Rd", "medicalHistory": "Coronary Artery Disease"},
            {"id": "P1034", "name": "Avery Baker", "age": 32, "gender": "Female", "contact": "+1 555-0134", "address": "802 Elm St", "medicalHistory": "None"},
            {"id": "P1035", "name": "Joseph Gonzalez", "age": 46, "gender": "Male", "contact": "+1 555-0135", "address": "913 Spruce Ave", "medicalHistory": "Prediabetes"},
            {"id": "P1036", "name": "Chloe Nelson", "age": 23, "gender": "Female", "contact": "+1 555-0136", "address": "147 Birch Dr", "medicalHistory": "None"},
            {"id": "P1037", "name": "Carter Carter", "age": 53, "gender": "Male", "contact": "+1 555-0137", "address": "258 Walnut Rd", "medicalHistory": "Asthma"},
            {"id": "P1038", "name": "Madison Mitchell", "age": 42, "gender": "Female", "contact": "+1 555-0138", "address": "369 Poplar Ave", "medicalHistory": "Migraines"},
            {"id": "P1039", "name": "Owen Perez", "age": 39, "gender": "Male", "contact": "+1 555-0139", "address": "480 Cherry Ln", "medicalHistory": "GERD"},
            {"id": "P1040", "name": "Grace Roberts", "age": 61, "gender": "Female", "contact": "+1 555-0140", "address": "591 Larch Dr", "medicalHistory": "Rheumatoid Arthritis"},
            {"id": "P1041", "name": "Wyatt Turner", "age": 35, "gender": "Male", "contact": "+1 555-0141", "address": "702 Alder Ave", "medicalHistory": "None"},
            {"id": "P1042", "name": "Scarlett Phillips", "age": 27, "gender": "Female", "contact": "+1 555-0142", "address": "813 Maple St", "medicalHistory": "Anxiety"},
            {"id": "P1043", "name": "John Campbell", "age": 57, "gender": "Male", "contact": "+1 555-0143", "address": "924 Pine Ln", "medicalHistory": "Type 2 Diabetes"},
            {"id": "P1044", "name": "Victoria Parker", "age": 44, "gender": "Female", "contact": "+1 555-0144", "address": "158 Spruce Blvd", "medicalHistory": "None"},
            {"id": "P1045", "name": "Dylan Evans", "age": 50, "gender": "Male", "contact": "+1 555-0145", "address": "269 Elm Dr", "medicalHistory": "Hypertension"},
            {"id": "P1046", "name": "Lily Edwards", "age": 31, "gender": "Female", "contact": "+1 555-0146", "address": "380 Oak Ave", "medicalHistory": "Allergic Rhinitis"},
            {"id": "P1047", "name": "Luke Collins", "age": 49, "gender": "Male", "contact": "+1 555-0147", "address": "491 Birch Ln", "medicalHistory": "Gout"},
            {"id": "P1048", "name": "Zoey Stewart", "age": 26, "gender": "Female", "contact": "+1 555-0148", "address": "602 Cherry Rd", "medicalHistory": "None"},
            {"id": "P1049", "name": "Gabriel Morris", "age": 56, "gender": "Male", "contact": "+1 555-0149", "address": "713 Poplar St", "medicalHistory": "High Cholesterol"},
            {"id": "P1050", "name": "Hannah Rogers", "age": 38, "gender": "Female", "contact": "+1 555-0150", "address": "824 Walnut Ln", "medicalHistory": "Asthma"},
            {"id": "P1051", "name": "Carter Rogers", "age": 41, "gender": "Male", "contact": "+1 555-0151", "address": "935 Alder Blvd", "medicalHistory": "None"},
            {"id": "P1052", "name": "Addison Reed", "age": 29, "gender": "Female", "contact": "+1 555-0152", "address": "169 Maple Rd", "medicalHistory": "None"},
            {"id": "P1053", "name": "Ryan Cook", "age": 63, "gender": "Male", "contact": "+1 555-0153", "address": "280 Pine St", "medicalHistory": "Chronic Kidney Disease"},
            {"id": "P1054", "name": "Natalie Morgan", "age": 35, "gender": "Female", "contact": "+1 555-0154", "address": "391 Spruce Ave", "medicalHistory": "GERD"},
            {"id": "P1055", "name": "Nathan Bell", "age": 47, "gender": "Male", "contact": "+1 555-0155", "address": "502 Larch Ln", "medicalHistory": "Hypertension"}
        ])

    if not load_json('doctors.json'):
        save_json('doctors.json', [
            {"id": "D2001", "name": "Dr. Sarah Johnson", "specialization": "Cardiology", "contact": "+1 555-0201", "schedule": "Mon-Wed 9AM-5PM", "available": True},
            {"id": "D2002", "name": "Dr. Michael Chen", "specialization": "Neurology", "contact": "+1 555-0202", "schedule": "Tue-Thu 10AM-6PM", "available": True},
            {"id": "D2003", "name": "Dr. Emily Brown", "specialization": "Pediatrics", "contact": "+1 555-0203", "schedule": "Mon-Fri 8AM-4PM", "available": True},
            {"id": "D2004", "name": "Dr. James Wilson", "specialization": "Orthopedics", "contact": "+1 555-0204", "schedule": "Mon-Fri 9AM-5PM", "available": True},
            {"id": "D2005", "name": "Dr. Sophia Martinez", "specialization": "Dermatology", "contact": "+1 555-0205", "schedule": "Mon-Thu 8AM-3PM", "available": True},
            {"id": "D2006", "name": "Dr. David K. Vance", "specialization": "Psychiatry", "contact": "+1 555-0206", "schedule": "Tue-Fri 11AM-7PM", "available": True},
            {"id": "D2007", "name": "Dr. Linda Jenkins", "specialization": "Endocrinology", "contact": "+1 555-0207", "schedule": "Mon-Wed 10AM-4PM", "available": True},
            {"id": "D2008", "name": "Dr. Robert Chen", "specialization": "Ophthalmology", "contact": "+1 555-0208", "schedule": "Wed-Fri 9AM-5PM", "available": True},
            {"id": "D2009", "name": "Dr. Clara Oswald", "specialization": "Internal Medicine", "contact": "+1 555-0209", "schedule": "Mon-Fri 8AM-4PM", "available": True},
            {"id": "D2010", "name": "Dr. Jonathan Crane", "specialization": "Psychiatry", "contact": "+1 555-0210", "schedule": "Mon-Thu 1PM-8PM", "available": True},
            {"id": "D2011", "name": "Dr. Alice Hamilton", "specialization": "Gynecology", "contact": "+1 555-0211", "schedule": "Tue-Thu 9AM-4PM", "available": True},
            {"id": "D2012", "name": "Dr. Richard Webber", "specialization": "General Surgery", "contact": "+1 555-0212", "schedule": "Mon-Fri 7AM-3PM", "available": True},
            {"id": "D2013", "name": "Dr. Miranda Bailey", "specialization": "General Surgery", "contact": "+1 555-0213", "schedule": "Mon-Fri 8AM-4PM", "available": True},
            {"id": "D2014", "name": "Dr. Derek Shepherd", "specialization": "Neurosurgery", "contact": "+1 555-0214", "schedule": "Mon-Wed 9AM-6PM", "available": True}
        ])

    if not load_json('appointments.json'):
        tomorrow = datetime.now() + timedelta(days=1)
        tomorrow_10am = tomorrow.replace(hour=10, minute=0, second=0, microsecond=0)
        tomorrow_2pm = tomorrow.replace(hour=14, minute=0, second=0, microsecond=0)
        save_json('appointments.json', [
            {"id": "A3001", "patientId": "P1001", "doctorId": "D2001",
             "dateTime": tomorrow_10am.strftime('%Y-%m-%dT%H:%M'), "status": "Scheduled",
             "reason": "Routine cardiac checkup"},
            {"id": "A3002", "patientId": "P1003", "doctorId": "D2002",
             "dateTime": tomorrow_2pm.strftime('%Y-%m-%dT%H:%M'),
             "status": "Scheduled", "reason": "Follow-up neurological exam"}
        ])

    if not load_json('bills.json'):
        save_json('bills.json', [
            {"id": "B4001", "patientId": "P1001", "description": "Cardiology Consultation",
             "amount": 250, "date": datetime.now().strftime('%Y-%m-%d'), "paid": False},
            {"id": "B4002", "patientId": "P1003", "description": "MRI Brain Scan",
             "amount": 1200, "date": datetime.now().strftime('%Y-%m-%d'), "paid": True},
            {"id": "B4003", "patientId": "P1004", "description": "Asthma Treatment Package",
             "amount": 450, "date": datetime.now().strftime('%Y-%m-%d'), "paid": False}
        ])

    if not load_json('prescriptions.json'):
        save_json('prescriptions.json', [
            {"id": "R5001", "patientId": "P1001", "doctorId": "D2001",
             "medication": "Lisinopril", "dosage": "10mg once daily",
             "duration": "30 days", "date": datetime.now().strftime('%Y-%m-%d'), "status": "Active"},
            {"id": "R5002", "patientId": "P1003", "doctorId": "D2002",
             "medication": "Metformin", "dosage": "500mg twice daily",
             "duration": "90 days", "date": datetime.now().strftime('%Y-%m-%d'), "status": "Active"}
        ])


# ========================== STATIC FILE ROUTES ==========================

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')


@app.route('/styles.css')
def serve_css():
    return send_from_directory('.', 'styles.css')


@app.route('/app.js')
def serve_js():
    return send_from_directory('.', 'app.js')


# ========================== DASHBOARD API ==========================

@app.route('/api/dashboard')
def get_dashboard():
    patients = load_json('patients.json')
    doctors = load_json('doctors.json')
    appointments = load_json('appointments.json')
    bills = load_json('bills.json')
    prescriptions = load_json('prescriptions.json')

    total_revenue = sum(b['amount'] for b in bills if b['paid'])
    pending_revenue = sum(b['amount'] for b in bills if not b['paid'])
    scheduled = [a for a in appointments if a['status'] == 'Scheduled']
    active_prescriptions = [p for p in prescriptions if p['status'] == 'Active']

    return jsonify({
        "totalPatients": len(patients),
        "totalDoctors": len(doctors),
        "totalAppointments": len(appointments),
        "scheduledAppointments": len(scheduled),
        "totalBills": len(bills),
        "totalRevenue": total_revenue,
        "pendingRevenue": pending_revenue,
        "activePrescriptions": len(active_prescriptions),
        "recentAppointments": scheduled[:5]
    })


# ========================== PATIENTS API ==========================

@app.route('/api/patients', methods=['GET'])
def get_patients():
    patients = load_json('patients.json')
    search = request.args.get('search', '').lower()
    if search:
        patients = [p for p in patients if
                     search in p['name'].lower() or
                     search in p['id'].lower() or
                     search in p.get('contact', '').lower()]
    return jsonify(patients)


@app.route('/api/patients', methods=['POST'])
def add_patient():
    data = request.json
    if not data or 'name' not in data or 'age' not in data or 'gender' not in data:
        return jsonify({"error": "Missing required fields: name, age, gender"}), 400
    patients = load_json('patients.json')
    new_id = generate_id('P', patients)
    patient = {
        "id": new_id,
        "name": data['name'],
        "age": int(data['age']),
        "gender": data['gender'],
        "contact": data.get('contact', ''),
        "address": data.get('address', ''),
        "medicalHistory": data.get('medicalHistory', '')
    }
    patients.append(patient)
    save_json('patients.json', patients)
    return jsonify(patient), 201


@app.route('/api/patients/<patient_id>', methods=['PUT'])
def update_patient(patient_id):
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
    patients = load_json('patients.json')
    for i, p in enumerate(patients):
        if p['id'] == patient_id:
            patients[i].update({
                "name": data.get('name', p['name']),
                "age": int(data.get('age', p['age'])),
                "gender": data.get('gender', p['gender']),
                "contact": data.get('contact', p['contact']),
                "address": data.get('address', p['address']),
                "medicalHistory": data.get('medicalHistory', p['medicalHistory'])
            })
            save_json('patients.json', patients)
            return jsonify(patients[i])
    return jsonify({"error": "Patient not found"}), 404


@app.route('/api/patients/<patient_id>', methods=['DELETE'])
def delete_patient(patient_id):
    patients = load_json('patients.json')
    patients = [p for p in patients if p['id'] != patient_id]
    save_json('patients.json', patients)
    return jsonify({"message": "Patient deleted"})


# ========================== DOCTORS API ==========================

@app.route('/api/doctors', methods=['GET'])
def get_doctors():
    return jsonify(load_json('doctors.json'))


@app.route('/api/doctors', methods=['POST'])
def add_doctor():
    data = request.json
    if not data or 'name' not in data or 'specialization' not in data:
        return jsonify({"error": "Missing required fields: name, specialization"}), 400
    doctors = load_json('doctors.json')
    new_id = generate_id('D', doctors)
    doctor = {
        "id": new_id,
        "name": data['name'],
        "specialization": data['specialization'],
        "contact": data.get('contact', ''),
        "schedule": data.get('schedule', 'Mon-Fri 9AM-5PM'),
        "available": True
    }
    doctors.append(doctor)
    save_json('doctors.json', doctors)
    return jsonify(doctor), 201


@app.route('/api/doctors/<doctor_id>', methods=['PUT'])
def update_doctor(doctor_id):
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
    doctors = load_json('doctors.json')
    for i, d in enumerate(doctors):
        if d['id'] == doctor_id:
            doctors[i].update({
                "name": data.get('name', d['name']),
                "specialization": data.get('specialization', d['specialization']),
                "contact": data.get('contact', d['contact']),
                "schedule": data.get('schedule', d['schedule']),
                "available": data.get('available', d['available'])
            })
            save_json('doctors.json', doctors)
            return jsonify(doctors[i])
    return jsonify({"error": "Doctor not found"}), 404


@app.route('/api/doctors/<doctor_id>/toggle', methods=['PUT'])
def toggle_doctor(doctor_id):
    """Toggle a doctor's availability status."""
    doctors = load_json('doctors.json')
    for i, d in enumerate(doctors):
        if d['id'] == doctor_id:
            doctors[i]['available'] = not d['available']
            save_json('doctors.json', doctors)
            return jsonify(doctors[i])
    return jsonify({"error": "Doctor not found"}), 404


@app.route('/api/doctors/<doctor_id>', methods=['DELETE'])
def delete_doctor(doctor_id):
    doctors = load_json('doctors.json')
    doctors = [d for d in doctors if d['id'] != doctor_id]
    save_json('doctors.json', doctors)
    return jsonify({"message": "Doctor deleted"})


# ========================== APPOINTMENTS API ==========================

@app.route('/api/appointments', methods=['GET'])
def get_appointments():
    return jsonify(load_json('appointments.json'))


@app.route('/api/appointments', methods=['POST'])
def add_appointment():
    data = request.json
    if not data or 'patientId' not in data or 'doctorId' not in data or 'dateTime' not in data:
        return jsonify({"error": "Missing required fields: patientId, doctorId, dateTime"}), 400
    appointments = load_json('appointments.json')
    new_id = generate_id('A', appointments)
    appointment = {
        "id": new_id,
        "patientId": data['patientId'],
        "doctorId": data['doctorId'],
        "dateTime": data['dateTime'],
        "status": "Scheduled",
        "reason": data.get('reason', '')
    }
    appointments.append(appointment)
    save_json('appointments.json', appointments)
    return jsonify(appointment), 201


@app.route('/api/appointments/<appt_id>', methods=['PUT'])
def update_appointment(appt_id):
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
    appointments = load_json('appointments.json')
    for i, a in enumerate(appointments):
        if a['id'] == appt_id:
            appointments[i]['status'] = data.get('status', a['status'])
            if 'reason' in data:
                appointments[i]['reason'] = data['reason']
            save_json('appointments.json', appointments)
            return jsonify(appointments[i])
    return jsonify({"error": "Appointment not found"}), 404


@app.route('/api/appointments/<appt_id>', methods=['DELETE'])
def delete_appointment(appt_id):
    """Delete an appointment."""
    appointments = load_json('appointments.json')
    appointments = [a for a in appointments if a['id'] != appt_id]
    save_json('appointments.json', appointments)
    return jsonify({"message": "Appointment deleted"})


# ========================== BILLING API ==========================

@app.route('/api/bills', methods=['GET'])
def get_bills():
    return jsonify(load_json('bills.json'))


@app.route('/api/bills', methods=['POST'])
def add_bill():
    data = request.json
    if not data or 'patientId' not in data or 'description' not in data or 'amount' not in data:
        return jsonify({"error": "Missing required fields: patientId, description, amount"}), 400
    bills = load_json('bills.json')
    new_id = generate_id('B', bills)
    bill = {
        "id": new_id,
        "patientId": data['patientId'],
        "description": data['description'],
        "amount": float(data['amount']),
        "date": datetime.now().strftime('%Y-%m-%d'),
        "paid": False
    }
    bills.append(bill)
    save_json('bills.json', bills)
    return jsonify(bill), 201


@app.route('/api/bills/<bill_id>/pay', methods=['PUT'])
def pay_bill(bill_id):
    bills = load_json('bills.json')
    for i, b in enumerate(bills):
        if b['id'] == bill_id:
            bills[i]['paid'] = True
            save_json('bills.json', bills)
            return jsonify(bills[i])
    return jsonify({"error": "Bill not found"}), 404


@app.route('/api/bills/<bill_id>', methods=['DELETE'])
def delete_bill(bill_id):
    """Delete a bill."""
    bills = load_json('bills.json')
    bills = [b for b in bills if b['id'] != bill_id]
    save_json('bills.json', bills)
    return jsonify({"message": "Bill deleted"})


# ========================== PRESCRIPTIONS API ==========================

@app.route('/api/prescriptions', methods=['GET'])
def get_prescriptions():
    return jsonify(load_json('prescriptions.json'))


@app.route('/api/prescriptions', methods=['POST'])
def add_prescription():
    data = request.json
    if not data or 'patientId' not in data or 'doctorId' not in data or 'medication' not in data or 'dosage' not in data:
        return jsonify({"error": "Missing required fields: patientId, doctorId, medication, dosage"}), 400
    prescriptions = load_json('prescriptions.json')
    new_id = generate_id('R', prescriptions)
    prescription = {
        "id": new_id,
        "patientId": data['patientId'],
        "doctorId": data['doctorId'],
        "medication": data['medication'],
        "dosage": data['dosage'],
        "duration": data.get('duration', ''),
        "date": datetime.now().strftime('%Y-%m-%d'),
        "status": "Active"
    }
    prescriptions.append(prescription)
    save_json('prescriptions.json', prescriptions)
    return jsonify(prescription), 201


# ========================== SYSTEM RESET API ==========================

@app.route('/api/reset', methods=['POST'])
def reset_system():
    """Delete all data files and re-seed with default data."""
    if os.path.exists(DATA_DIR):
        shutil.rmtree(DATA_DIR)
    os.makedirs(DATA_DIR, exist_ok=True)
    seed_data()
    return jsonify({"message": "System reset successfully"})


# ========================== START SERVER ==========================

if __name__ == '__main__':
    seed_data()
    print("\n" + "=" * 55)
    print("  [+] Premium Healthcare Management System")
    print("  [>] Running at: http://localhost:5000")
    print("  [>] Data stored in: ./data/")
    print("=" * 55 + "\n")
    app.run(debug=True, port=5000)