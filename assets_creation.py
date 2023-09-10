from json import load

from backend.db import DB
from backend.models.Civilization import Civilization

def create_civilizations(db:DB):
    with open('assets/civilizations.json') as civilizations_file:
        civilizations = load(civilizations_file)['civilizations']
        db.add_all(instances=[Civilization.from_raw(civilization) for civilization in civilizations])
        db.commit()

if __name__ == '__main__':
    with DB() as db: create_civilizations(db)
