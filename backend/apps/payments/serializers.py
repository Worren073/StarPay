from rest_framework import serializers
from .models import Invoice, Transaction, PaymentProof


class PaymentProofSerializer(serializers.ModelSerializer):
    invoice_number = serializers.CharField(source='invoice.id', read_only=True)

    class Meta:
        model = PaymentProof
        fields = '__all__'
        read_only_fields = ('invoice', 'submitted_at')


class InvoiceSerializer(serializers.ModelSerializer):
    athlete_name = serializers.CharField(source='athlete.name', read_only=True)

    class Meta:
        model = Invoice
        fields = '__all__'


class TransactionSerializer(serializers.ModelSerializer):
    invoice_number = serializers.CharField(source='invoice.id', read_only=True)

    class Meta:
        model = Transaction
        fields = '__all__'
