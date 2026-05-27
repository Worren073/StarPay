from django.contrib import admin
from .models import Invoice, Transaction


class TransactionInline(admin.TabularInline):
    model = Transaction
    extra = 0


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('id', 'athlete', 'amount', 'status', 'due_date', 'created_at')
    list_filter = ('status',)
    search_fields = ('athlete__name',)
    inlines = [TransactionInline]


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('reference', 'invoice', 'amount', 'status', 'processed_at')
    list_filter = ('status',)
