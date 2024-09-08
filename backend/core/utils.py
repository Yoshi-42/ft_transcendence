import pyotp
from datetime import datetime, timedelta
from django.core.mail import send_mail


def	send_otp(request, mail):
	totp = pyotp.TOTP(pyotp.random_base32(), interval = 60)
	otp = totp.now() #otp que l'utilisateur devra entrer au moment de la connexion
	request.session['otp_secret_key'] = totp.secret
	valid_date = datetime.now() + timedelta(minutes=1)
	request.session['otp_valid_date'] = str(valid_date) #enregistrer la date d'expiration de l'otp dans la session utilisateur
	print(f"OTP = {otp}")
	subject = "Your OTP cocode"
	message = f"Your OTP code is {otp}.\nOTP valid until {valid_date}."
	recipient_list = [mail]
	#mes_couilles = send_mail(subject, message, EMAIL_HOST_USER, recipient_list, fail_silently=False)
	print(f"mail = {send_mail(subject, message, 'transcendence-boucal@gmail.com', recipient_list, fail_silently=False)}")
	#logger(send_mail())
	return otp
# 	EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
# EMAIL_HOST = "smtp.gmail.com"
# EMAIL_PORT = 587
# EMAIL_USE_TLS = True
# EMAIL_HOST_USER = "transcendence-boucal@gmail.com"
# EMAIL_HOST_PASSWORD = "jtbxnknedvnnjicy"
# DEFAULT_FROM_MAIL = "transcendence-boucal@gmail.com"
