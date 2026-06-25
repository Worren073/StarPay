from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import PaymentProof, Invoice
from apps.notifications.views import send_notification
from apps.users.models import User


@receiver(post_save, sender=PaymentProof)
def notify_payment_submitted(sender, instance, created, **kwargs):
    if not created:
        return
    admins = User.objects.filter(role='admin')
    for admin in admins:
        send_notification(
            user=admin,
            notification_type='payment_submitted',
            title='Nuevo pago recibido',
            message=f'{instance.invoice.athlete.name} ha enviado un comprobante de pago por ${instance.invoice.amount}',
            link='/payments',
        )


@receiver(post_save, sender=Invoice)
def notify_invoice_created(sender, instance, created, **kwargs):
    if not created:
        return
    if instance.athlete.user:
        send_notification(
            user=instance.athlete.user,
            notification_type='invoice_created',
            title='Nueva factura',
            message=f'Se ha generado una nueva factura por ${instance.amount}: {instance.description}',
            link='/athlete/pagos',
        )


@receiver(post_save, sender=Invoice)
def notify_invoice_status_change(sender, instance, created, **kwargs):
    if created:
        return
    if instance.status == 'paid' and instance.athlete.user:
        send_notification(
            user=instance.athlete.user,
            notification_type='payment_verified',
            title='Pago verificado',
            message=f'Tu pago de ${instance.amount} ha sido verificado',
            link='/athlete/pagos',
        )
    elif instance.status in ('overdue', 'pending') and instance.athlete.user:
        try:
            old_status = Invoice.objects.get(pk=instance.pk)
        except Invoice.DoesNotExist:
            return
        if old_status.status != instance.status:
            if instance.status == 'overdue':
                send_notification(
                    user=instance.athlete.user,
                    notification_type='payment_rejected',
                    title='Pago rechazado',
                    message=f'Tu pago de ${instance.amount} ha sido rechazado o está vencido',
                    link='/athlete/pagos',
                )
