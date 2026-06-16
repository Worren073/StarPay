from django.db import models
from django.conf import settings


class Notification(models.Model):
    TYPE_CHOICES = (
        ('payment_submitted', 'Pago recibido'),
        ('payment_verified', 'Pago verificado'),
        ('payment_rejected', 'Pago rechazado'),
        ('plan_expiring', 'Plan próximo a vencer'),
        ('plan_expired', 'Plan vencido'),
        ('plan_renewed', 'Plan renovado'),
        ('competition_invite', 'Invitación a competencia'),
        ('competition_assigned', 'Competencia asignada'),
        ('progress_updated', 'Progreso actualizado'),
        ('athlete_assigned', 'Atleta asignado'),
        ('competition_reminder', 'Recordatorio de competencia'),
    )

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    notification_type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    link = models.CharField(max_length=500, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.get_notification_type_display()}] {self.recipient.email} - {self.title[:50]}"
