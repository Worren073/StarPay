from django.db.models.signals import post_save, m2m_changed
from django.dispatch import receiver
from .models import Athlete, AthletePlan, Plan, AthleteProgress
from apps.notifications.views import send_notification
from datetime import date, timedelta


@receiver(post_save, sender=AthleteProgress)
def notify_progress_updated(sender, instance, created, **kwargs):
    if not created:
        return
    athlete = instance.athlete
    if athlete.user:
        send_notification(
            user=athlete.user,
            notification_type='progress_updated',
            title='Progreso actualizado',
            message=f'Tu entrenador ha registrado nuevo progreso: Velocidad {instance.speed_score}, Técnica {instance.technique_score}, Forma {instance.form_score}',
            link='/athlete/rendimiento',
        )


@receiver(m2m_changed, sender=Athlete.coaches.through)
def notify_coach_added(sender, instance, action, reverse, model, pk_set, **kwargs):
    if action != 'post_add':
        return
    if reverse:
        staff_member = instance
        for athlete_id in pk_set:
            athlete = Athlete.objects.get(id=athlete_id)
            for coach in athlete.coaches.all():
                if coach.user:
                    send_notification(
                        user=coach.user,
                        notification_type='athlete_assigned',
                        title='Nuevo atleta asignado',
                        message=f'Se te ha asignado al atleta {athlete.name}',
                        link='/athletes',
                    )
    else:
        athlete = instance
        for coach_id in pk_set:
            from apps.staff.models import StaffMember
            coach = StaffMember.objects.get(id=coach_id)
            if coach.user:
                send_notification(
                    user=coach.user,
                    notification_type='athlete_assigned',
                    title='Nuevo atleta asignado',
                    message=f'Se te ha asignado al atleta {athlete.name}',
                    link='/athletes',
                )


@receiver(post_save, sender=Athlete)
def create_athlete_plan(sender, instance, created, **kwargs):
    if not created:
        return
    default_plan, _ = Plan.objects.get_or_create(
        name="Plan Mensual",
        defaults={
            'duration_days': 30,
            'price': 25.00,
        }
    )
    today = date.today()
    AthletePlan.objects.get_or_create(
        athlete=instance,
        defaults={
            'plan': default_plan,
            'start_date': today,
            'end_date': today + timedelta(days=default_plan.duration_days),
        }
    )
