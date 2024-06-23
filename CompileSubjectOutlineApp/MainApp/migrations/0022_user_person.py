# Generated by Django 5.0.3 on 2024-05-30 09:08

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('MainApp', '0021_person'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='person',
            field=models.OneToOneField(null=True, on_delete=django.db.models.deletion.CASCADE, to='MainApp.person'),
        ),
    ]
