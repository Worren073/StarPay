import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'starpay_core.settings')
django.setup()

from django.contrib.auth import get_user_model
from datetime import date, time, datetime, timedelta
from decimal import Decimal
from apps.staff.models import StaffMember
from apps.athletes.models import Athlete, AthleteProgress, Plan, AthletePlan
from apps.competitions.models import Competition, Result, CompetitionAthlete, CompetitionCoach
from apps.payments.models import Invoice, Transaction

User = get_user_model()

print("Creating admin user...")
if not User.objects.filter(email='admin@starpay.com').exists():
    User.objects.create_superuser(
        username='admin',
        email='admin@starpay.com',
        password='admin123',
        role='admin'
    )
    print("  Admin created: admin@starpay.com / admin123")

print("Creating athlete user...")
athlete_user, created = User.objects.get_or_create(
    email='atleta@starpay.com',
    defaults={
        'username': 'atleta.demo',
        'role': 'athlete',
        'phone': '555-0100',
    }
)
if created:
    athlete_user.set_password('atleta123')
    athlete_user.save()
    print(f"  Athlete user created: {athlete_user.email} / atleta123")

print("Creating staff members...")
staff_data = [
    {'name': 'Marcus Thorne', 'specialty': 'speed', 'status': 'in_facility', 'athletes_count': 24, 'next_session_time': time(14, 0)},
    {'name': 'Elena Rostova', 'specialty': 'speed', 'status': 'in_facility', 'athletes_count': 18, 'next_session_time': time(16, 30)},
    {'name': 'David Chen', 'specialty': 'power', 'status': 'off_duty', 'athletes_count': 32, 'next_session_time': None},
    {'name': 'Sarah Mitchell', 'specialty': 'power', 'status': 'in_facility', 'athletes_count': 15, 'next_session_time': time(10, 0)},
]

staff_members = []
for sd in staff_data:
    obj, created = StaffMember.objects.get_or_create(name=sd['name'], defaults=sd)
    staff_members.append(obj)
    if created:
        print(f"  Created: {obj.name}")

print("Creating athletes...")
athletes_data = [
    {'name': 'Elena Rostova', 'age': 19, 'level': 'elite', 'category': 'Senior Freeskate', 'status': 'active', 'speed_score': 94, 'technique_score': 98, 'form_score': 92, 'coach_idx': 0},
    {'name': 'Marcus Chen', 'age': 22, 'level': 'pro', 'category': 'Junior Short', 'status': 'active', 'speed_score': 85, 'technique_score': 88, 'form_score': 82, 'coach_idx': 0},
    {'name': 'Sarah Jenkins', 'age': 16, 'level': 'beginner', 'category': 'Novice Free', 'status': 'active', 'speed_score': 60, 'technique_score': 65, 'form_score': 70, 'coach_idx': 1},
    {'name': 'Juan Martinez', 'age': 20, 'level': 'elite', 'category': 'Senior Freeskate', 'status': 'active', 'speed_score': 91, 'technique_score': 95, 'form_score': 88, 'coach_idx': 2},
    {'name': 'Anna Smith', 'age': 18, 'level': 'pro', 'category': 'Junior Short', 'status': 'active', 'speed_score': 78, 'technique_score': 82, 'form_score': 80, 'coach_idx': 3},
    {'name': 'Sofia Rodriguez', 'age': 17, 'level': 'elite', 'category': 'Senior Freeskate', 'status': 'active', 'speed_score': 96, 'technique_score': 93, 'form_score': 95, 'coach_idx': 0},
    {'name': 'Julian Santos', 'age': 15, 'level': 'pro', 'category': 'Junior Short', 'status': 'active', 'speed_score': 72, 'technique_score': 78, 'form_score': 75, 'coach_idx': 1},
    {'name': 'Mia Kim', 'age': 14, 'level': 'beginner', 'category': 'Novice Free', 'status': 'active', 'speed_score': 55, 'technique_score': 60, 'form_score': 62, 'coach_idx': 3},
    {'name': 'David Thompson', 'age': 21, 'level': 'elite', 'category': 'Senior Freeskate', 'status': 'active', 'speed_score': 89, 'technique_score': 91, 'form_score': 87, 'coach_idx': 2},
    {'name': 'Lisa Park', 'age': 19, 'level': 'pro', 'category': 'Junior Short', 'status': 'inactive', 'speed_score': 76, 'technique_score': 80, 'form_score': 78, 'coach_idx': 0},
    {'name': 'Demo Athlete', 'age': 18, 'level': 'elite', 'category': 'Senior Freeskate', 'status': 'active', 'speed_score': 82, 'technique_score': 79, 'form_score': 85, 'coach_idx': 0},
]

athletes = []
for ad in athletes_data:
    coach_idx = ad.pop('coach_idx')
    coach = staff_members[coach_idx]
    obj, created = Athlete.objects.get_or_create(name=ad['name'], defaults=ad)
    if created:
        obj.coaches.add(coach)
    athletes.append(obj)
    if created:
        print(f"  Created: {obj.name} ({obj.level})")

# Link athlete user to the demo athlete
demo_athlete = Athlete.objects.get(name='Demo Athlete')
if not demo_athlete.user:
    demo_athlete.user = athlete_user
    demo_athlete.save()
    print(f"  Linked athlete user to: {demo_athlete.name}")

print("Creating default plan...")
default_plan, created = Plan.objects.get_or_create(
    name="Plan Mensual",
    defaults={
        'duration_days': 30,
        'price': Decimal('25.00'),
    }
)
if created:
    print(f"  Created: {default_plan.name}")

print("Assigning plans to athletes...")
today = date.today()
for athlete in Athlete.objects.all():
    AthletePlan.objects.get_or_create(
        athlete=athlete,
        defaults={
            'plan': default_plan,
            'start_date': today - timedelta(days=10),
            'end_date': today + timedelta(days=20),
        }
    )
    print(f"  Plan assigned to {athlete.name}")

print("Creating competitions...")
competitions_data = [
    {'name': 'Regional Qualifiers', 'date': date(2024, 10, 15), 'location': 'Denver Ice Arena', 'type': 'qualifier', 'status': 'upcoming', 'max_athletes': 30, 'description': 'Official qualifier for the Western Division championships. Top 10 advance.'},
    {'name': 'National Championships', 'date': date(2024, 11, 2), 'location': 'Chicago Winter Center', 'type': 'championship', 'status': 'upcoming', 'max_athletes': 20, 'description': 'Premier national event for all elite tiers.'},
    {'name': 'Fall Invitational', 'date': date(2024, 9, 20), 'location': 'Home Rink', 'type': 'exhibition', 'status': 'completed', 'max_athletes': 50, 'description': 'End of season performance for all junior and senior levels.'},
]

competitions = []
for cd in competitions_data:
    obj, created = Competition.objects.get_or_create(name=cd['name'], defaults=cd)
    competitions.append(obj)
    if created:
        print(f"  Created: {obj.name}")

print("Assigning coaches to competitions...")
for comp in competitions[:2]:
    for coach in staff_members[:2]:
        CompetitionCoach.objects.get_or_create(
            competition=comp,
            staff_member=coach,
        )
        print(f"  Assigned {coach.name} to {comp.name}")

print("Assigning athletes to competitions...")
# Assign demo athlete to the first two competitions
for comp in competitions[:2]:
    CompetitionAthlete.objects.get_or_create(
        competition=comp,
        athlete=demo_athlete,
        defaults={'status': 'confirmed'}
    )
    print(f"  Assigned {demo_athlete.name} to {comp.name}")

# Assign other athletes to competitions
ca_assignments = [
    (competitions[0], athletes[0], 'confirmed'),
    (competitions[0], athletes[1], 'invited'),
    (competitions[0], athletes[5], 'confirmed'),
    (competitions[0], athletes[3], 'invited'),
    (competitions[1], athletes[0], 'invited'),
    (competitions[1], athletes[5], 'confirmed'),
]
for comp, athlete, status_val in ca_assignments:
    CompetitionAthlete.objects.get_or_create(
        competition=comp,
        athlete=athlete,
        defaults={'status': status_val}
    )

print("Creating results for completed competition...")
fall_inv = Competition.objects.get(name='Fall Invitational')
results_data = [
    {'athlete': athletes[0], 'score': Decimal('142.50'), 'position': 1, 'category': 'Senior Freeskate'},
    {'athlete': athletes[5], 'score': Decimal('138.20'), 'position': 2, 'category': 'Senior Freeskate'},
    {'athlete': athletes[3], 'score': Decimal('135.80'), 'position': 3, 'category': 'Senior Freeskate'},
    {'athlete': athletes[1], 'score': Decimal('118.20'), 'position': 1, 'category': 'Junior Short'},
    {'athlete': athletes[4], 'score': Decimal('95.80'), 'position': 1, 'category': 'Novice Free'},
]

for rd in results_data:
    Result.objects.get_or_create(
        competition=fall_inv,
        athlete=rd['athlete'],
        defaults=rd
    )

print("Creating athlete progress records...")
AthleteProgress.objects.get_or_create(
    athlete=demo_athlete,
    recorded_at=datetime(2024, 9, 1),
    defaults={
        'speed_score': 75,
        'technique_score': 72,
        'form_score': 78,
    }
)
AthleteProgress.objects.get_or_create(
    athlete=demo_athlete,
    recorded_at=datetime(2024, 9, 15),
    defaults={
        'speed_score': 78,
        'technique_score': 75,
        'form_score': 80,
    }
)
AthleteProgress.objects.get_or_create(
    athlete=demo_athlete,
    recorded_at=datetime(2024, 10, 1),
    defaults={
        'speed_score': 82,
        'technique_score': 79,
        'form_score': 85,
    }
)
print(f"  Created progress records for {demo_athlete.name}")

print("Creating invoices...")
invoices_data = [
    {'athlete': athletes[0], 'amount': Decimal('1200.00'), 'status': 'paid', 'due_date': date(2024, 10, 1), 'description': 'Monthly training fee - October'},
    {'athlete': athletes[1], 'amount': Decimal('850.00'), 'status': 'pending', 'due_date': date(2024, 11, 1), 'description': 'Monthly training fee - November'},
    {'athlete': athletes[2], 'amount': Decimal('2400.00'), 'status': 'overdue', 'due_date': date(2024, 9, 15), 'description': 'Elite program quarterly fee'},
    {'athlete': athletes[3], 'amount': Decimal('450.00'), 'status': 'paid', 'due_date': date(2024, 10, 1), 'description': 'Competition registration fee'},
    {'athlete': athletes[4], 'amount': Decimal('1500.00'), 'status': 'pending', 'due_date': date(2024, 11, 15), 'description': 'Monthly training fee - November'},
    {'athlete': athletes[5], 'amount': Decimal('3200.00'), 'status': 'paid', 'due_date': date(2024, 10, 1), 'description': 'Elite program quarterly fee'},
    {'athlete': demo_athlete, 'amount': Decimal('950.00'), 'status': 'pending', 'due_date': date(2024, 11, 1), 'description': 'Monthly training fee - November'},
    {'athlete': demo_athlete, 'amount': Decimal('500.00'), 'status': 'paid', 'due_date': date(2024, 10, 1), 'description': 'Equipment fee'},
]

invoices = []
for idata in invoices_data:
    obj, created = Invoice.objects.get_or_create(
        athlete=idata['athlete'],
        amount=idata['amount'],
        defaults=idata
    )
    invoices.append(obj)
    if created:
        print(f"  Created: Invoice #{obj.id} for {obj.athlete.name}")

print("Creating transactions...")
transactions_data = [
    {'invoice': invoices[0], 'reference': 'TXN-2024-001', 'amount': Decimal('1200.00'), 'method': 'Bank Transfer', 'status': 'paid'},
    {'invoice': invoices[3], 'reference': 'TXN-2024-002', 'amount': Decimal('450.00'), 'method': 'Credit Card', 'status': 'paid'},
    {'invoice': invoices[5], 'reference': 'TXN-2024-003', 'amount': Decimal('3200.00'), 'method': 'Bank Transfer', 'status': 'paid'},
    {'invoice': invoices[7], 'reference': 'TXN-2024-004', 'amount': Decimal('500.00'), 'method': 'Bank Transfer', 'status': 'paid'},
]

for td in transactions_data:
    Transaction.objects.get_or_create(reference=td['reference'], defaults=td)

print("\nSeed data complete!")
print(f"  Users: {User.objects.count()}")
print(f"  Staff: {StaffMember.objects.count()}")
print(f"  Athletes: {Athlete.objects.count()}")
print(f"  AthleteProgress: {AthleteProgress.objects.count()}")
print(f"  Competitions: {Competition.objects.count()}")
print(f"  Results: {Result.objects.count()}")
print(f"  CompetitionAthletes: {CompetitionAthlete.objects.count()}")
print(f"  CompetitionCoaches: {CompetitionCoach.objects.count()}")
print(f"  Invoices: {Invoice.objects.count()}")
print(f"  Transactions: {Transaction.objects.count()}")
