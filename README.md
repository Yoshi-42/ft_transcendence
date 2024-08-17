# !!! Ne pas passer Django en DEBUG = false (settings.py) !!!

Sauf si vous voulez vous prendre la tete avec les fichiers statiques de django en prod ^^ 

# INSTALL

Il n'y a rien a faire, juste un docker compose up --build et modifier le .env_back en .env, l'install est automatisee, finalement j'ai prefere passer par un nginx pour le front histoire de separer les problemes...
Tout est deja prevu dans Django, la creation d'un user admin, la config du fichier settings, du fichier urls.py, l'ajout de postGres...
Le postGres rien de particulier.
Pour le front je vous ai deja prepare un exemple de code single-page histoire que vous ne partiez dans le noir complet, si j'ai un peu de temps ce we, j'essaie de rajouter le signup sign in et la protection des routes selon l'etat de connexion du user mais je promets pas de miracles ^^
Si vous avez des questions, hesitez pas !

# KNOWN BUGS

- L'historique des pages visitees ne fonctionne que pour une seule page en arriere ou en avant ;)

# ft_transcendence
Projet ft_transcendence 42 Perpignan

ft_transcendence Surprise.
IV.1 Vue d’ensemble
• Web
◦ Module majeur : Utiliser un framework en backend.	
◦ Module mineur : Utiliser un framework ou toolkit en frontend.
◦ Module mineur : Utiliser une base de données en backend.


 Gestion utilisateur
◦ Module majeur : Gestion utilisateur standard, authentification, utilisateurs en tournois.

◦ Module majeur : Implémenter une authentification à distance.
CyberSecurité:
◦ Module majeur : Implémenter l’authentification à 2 facteurs (2FA) et JWT(JSON Web Tokens).



Gameplay
◦ Module majeur : Joueurs à distance
• IA-Algo
◦ Module majeur : Implémenter un adversaire contrôlé par IA.







Backend en Django
	Fournir les pages html
	Gerer les bases de donnée (entré/sortie)
	
Front en Bootstrap
	Pour les pages et le design

Single page : Une page à lancer et des fenetres pour toute les autres interaction

Le jeu:
	Le jeu dois pourvoir être jouer en local, à distance, et face à une IA
	L'organisation des tournois 
