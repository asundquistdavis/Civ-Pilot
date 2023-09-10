
class Error(Exception):

    error = 0
    message = 'error'
    STATUS_CODE = 400

    def __json__(self, flavor=None):
        return {'error': self.error,'message': self.message}, self.STATUS_CODE

class InvalidPassword(Error):

    error = 11
    message = 'invalid password'

class GamePlayerNotFound(Error):

    error = 22
    message = 'game-player not found'
    
class NoPlayer(Error):

    error = 20
    message = 'player not found'

class PlayerNotAuthorized(Error):

    error = 12
    message = 'player is not authorized'
    
class PlayerExists(Error):

    error = 15
    message = 'player already exists'

class PasswordsDoNotMatch(Error):

    error = 16
    message = 'passwords do no match'
    
class InvalidToken(Error):

    error = 10
    message = 'token is invalid'
    
class InvalidInput(Error):

    error = 5
    message = 'invalid input'

class GameNotFound(Error):

    error = 21
    message = 'game not found'

class CivilizationNotFound(Error):

    error = 23
    message = 'civilization not found'

class CivilizationTaken(Error):

    error = 31
    message = 'civilization is taken'

AppError = (InvalidPassword, NoPlayer, PlayerExists, PasswordsDoNotMatch, InvalidToken, InvalidInput, GameNotFound, GamePlayerNotFound, PlayerNotAuthorized, CivilizationTaken)
