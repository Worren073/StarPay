from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import CompetitionAthlete, CompetitionCoach
from apps.notifications.views import send_notification


@receiver(post_save, sender=CompetitionAthlete)
def notify_competition_invite(sender, instance, created, **kwargs):
    if not created:
        return
    athlete = instance.athlete
    if athlete.user:
        send_notification(
            user=athlete.user,
            notification_type='competition_invite',
            title='Invitación a competencia',
            message=f'Has sido invitado a la competencia {instance.competition.name}',
            link='/athlete/competencias',
        )


@receiver(post_save, sender=CompetitionCoach)
def notify_competition_assigned(sender, instance, created, **kwargs):
    if not created:
        return
    staff = instance.staff_member
    if staff.user:
        send_notification(
            user=staff.user,
            notification_type='competition_assigned',
            title='Competencia asignada',
            message=f'Se te ha asignado como entrenador en {instance.competition.name}',
            link='/competitions',
        )
