# Generated by Django 5.0.3 on 2024-05-30 03:32

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('MainApp', '0014_alter_subjectoutline_subject'),
    ]

    operations = [
        migrations.AlterField(
            model_name='subjectoutline',
            name='subject',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='MainApp.subject'),
        ),
    ]
