from django.db import models


class Competition(models.Model):
    TYPE_CHOICES = (
        ('qualifier', 'Qualifier'),
        ('championship', 'Championship'),
        ('exhibition', 'Exhibition'),
    )
    STATUS_CHOICES = (
        ('upcoming', 'Upcoming'),
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
    )

    name = models.CharField(max_length=200)
    date = models.DateField()
    location = models.CharField(max_length=200)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='upcoming')
    max_athletes = models.PositiveIntegerField()
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['date']

    def __str__(self):
        return f"{self.name} ({self.date})"


class Result(models.Model):
    competition = models.ForeignKey(Competition, related_name='results', on_delete=models.CASCADE)
    athlete = models.ForeignKey('athletes.Athlete', on_delete=models.CASCADE)
    score = models.DecimalField(max_digits=6, decimal_places=2)
    position = models.PositiveIntegerField()
    category = models.CharField(max_length=100, blank=True)

    class Meta:
        ordering = ['position']
        unique_together = ('competition', 'athlete')

    def __str__(self):
        return f"{self.athlete.name} - #{self.position} in {self.competition.name}"
