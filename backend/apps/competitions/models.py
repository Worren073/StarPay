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


class CompetitionAthlete(models.Model):
    STATUS_CHOICES = (
        ('invited', 'Invitado'),
        ('confirmed', 'Confirmado'),
        ('participated', 'Participó'),
        ('declined', 'Declinado'),
    )

    competition = models.ForeignKey(Competition, on_delete=models.CASCADE, related_name='assigned_athletes')
    athlete = models.ForeignKey('athletes.Athlete', on_delete=models.CASCADE, related_name='competition_assignments')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='invited')

    class Meta:
        unique_together = ('competition', 'athlete')
        verbose_name_plural = 'Competition athletes'

    def __str__(self):
        return f"{self.athlete.name} - {self.competition.name} ({self.status})"


class CompetitionCoach(models.Model):
    competition = models.ForeignKey(Competition, on_delete=models.CASCADE, related_name='assigned_coaches')
    staff_member = models.ForeignKey('staff.StaffMember', on_delete=models.CASCADE, related_name='competition_assignments')

    class Meta:
        unique_together = ('competition', 'staff_member')
        verbose_name_plural = 'Competition coaches'

    def __str__(self):
        return f"{self.staff_member.name} - {self.competition.name}"
