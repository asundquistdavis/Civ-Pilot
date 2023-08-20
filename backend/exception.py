
class Error(Exception):

    error = 0
    message = 'error'
    STATUS_CODE = 400

    def __json__(self, flavor=None):
        return {'error': self.error,'message': self.message}, self.STATUS_CODE

class InvalidPassword(Error):

    error = 11
    message = 'invalid password'

    
class NoPlayer(Error):

    error = 12
    message = 'player does not exist'
    
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

    error = 7
    message = 'game not found'

AppError = (InvalidPassword, NoPlayer, PlayerExists, PasswordsDoNotMatch, InvalidToken, InvalidInput, GameNotFound)
