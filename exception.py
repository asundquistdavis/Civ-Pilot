class IncompleteInputError(Exception):
    STATUS_CODE = 400
    def dict(self)->dict: return {'message': 'incomplete input'}

class PasswordDoesNotMatchError(Exception):
    STATUS_CODE = 400
    def dict(self)->dict: return {'message': 'passwords do not match'}

class UserNameTakenError(Exception):
    STATUS_CODE = 400
    def dict(self)->dict: return {'message': 'user name is taken'}

class NoSuchUserError(Exception):
    STATUS_CODE = 401
    def dict(self)->dict: return {'message': 'no such user'}

class InvalidCredentialsError(Exception):
    STATUS_CODE = 400
    def dict(self)->dict: return {'message': 'invalid credentials'}

class PlayerNotAutherizedError(Exception):
    STATUS_CODE = 401
    def dict(self)->dict: return {'message': 'player is not autherized to make this request'}

class PlayerNotFoundError(Exception):
    STATUS_CODE = 400
    def dict(self)->dict: return {'message': 'player not found'}

class GamePlayersNotReady(Exception):
    STATUS_CODE = 400
    def dict(self)->dict: return {'message': 'some players do not have a civilization selected'}

class IvalidRequestError(Exception):
    STATUS_CODE = 400
    def dict(self)->dict: return {'message': 'required param missing from request'}

class GameInProgressError(Exception):
    STATUS_CODE = 400
    def dict(self)->dict: return {'message': 'game is already in progress'}

AuthError = (IncompleteInputError, PasswordDoesNotMatchError, UserNameTakenError, InvalidCredentialsError, NoSuchUserError, PlayerNotAutherizedError, PlayerNotFoundError, GamePlayersNotReady, IvalidRequestError, GameInProgressError)
