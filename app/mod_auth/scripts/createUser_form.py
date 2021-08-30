
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SelectField
from wtforms.validators import DataRequired, Length, EqualTo, Email

class UserCreationForm(FlaskForm):
    """User form."""
    fullname = StringField('Full Name', [
            DataRequired()
        ])
    institution = StringField('Institution', [
            DataRequired()
        ])
    email = StringField('Email Address',[
            DataRequired(),
            Email(message = ('Not a valid email address.'))
        ])
    username = StringField('Username', [
            DataRequired(),
            Length(min = 4, max = 40)
        ])
    password = PasswordField('New Password', [
            DataRequired(),
            Length(min = 4, max = 20)
        ])
    confirm = PasswordField('Repeat Password', [
            DataRequired(),
            EqualTo('password', message = 'Passwords must match')
        ])
    userlevel = SelectField('User Access', choices = [
        ('1', 'Level 1'), ('2', 'Level 2')
        ])
