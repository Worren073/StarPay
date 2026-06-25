import base64
import os
import uuid
from django.db import models


def comprobante_upload_path(instance, filename):
    ext = filename.split('.')[-1]
    return os.path.join('comprobantes', f'invoice_{instance.invoice.id}_{uuid.uuid4().hex[:8]}.{ext}')


class Invoice(models.Model):
    STATUS_CHOICES = (
        ('paid', 'Paid'),
        ('pending', 'Pending'),
        ('overdue', 'Overdue'),
    )
    INVOICE_TYPE_CHOICES = (
        ('plan_renewal', 'Renovación de plan'),
        ('other', 'Otro'),
    )

    athlete = models.ForeignKey('athletes.Athlete', on_delete=models.CASCADE, related_name='invoices')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    invoice_type = models.CharField(max_length=20, choices=INVOICE_TYPE_CHOICES, default='other')
    due_date = models.DateField()
    description = models.CharField(max_length=300, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Invoice #{self.id} - {self.athlete.name} - ${self.amount}"


class Transaction(models.Model):
    invoice = models.ForeignKey(Invoice, related_name='transactions', on_delete=models.CASCADE)
    reference = models.CharField(max_length=50, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    method = models.CharField(max_length=50, blank=True)
    status = models.CharField(max_length=10, choices=Invoice.STATUS_CHOICES)
    processed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-processed_at']

    def __str__(self):
        return f"Transaction {self.reference} - ${self.amount}"


class PaymentProof(models.Model):
    METHOD_CHOICES = (
        ('pago_movil', 'Pago Móvil'),
        ('transferencia', 'Transferencia'),
        ('cash', 'Efectivo'),
    )
    ID_TYPE_CHOICES = (
        ('V', 'Venezolana'),
        ('E', 'Extranjera'),
        ('J', 'Jurídica'),
    )

    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='proofs')
    method = models.CharField(max_length=20, choices=METHOD_CHOICES)
    phone = models.CharField(max_length=20)
    id_type = models.CharField(max_length=1, choices=ID_TYPE_CHOICES, default='V')
    id_number = models.CharField(max_length=20)
    amount_ves = models.DecimalField(max_digits=12, decimal_places=2)
    reference = models.CharField(max_length=50, blank=True)
    bank_origin = models.CharField(max_length=100, blank=True)
    image = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=10, choices=Invoice.STATUS_CHOICES, default='pending')
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-submitted_at']

    def __str__(self):
        return f"Proof #{self.id} - Invoice #{self.invoice.id} - {self.get_method_display()}"
