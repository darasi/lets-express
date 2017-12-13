import Boom from 'boom';
import auth from '../config/auth';
import Token from '../models/Token';
import * as jwt from 'jsonwebtoken';

/**
 * Validate access token.
 *
 * @param  {object}   request
 * @param  {object}   response
 * @param  {function} next
 * @returns {Promise}
 */
export function validateAccessToken(request, response, next) {
  if ('authorization' in request.headers) {
    jwt.verify(request.headers.authorization.substring(7), auth.accessTokenSalt, (error, decodedToken) => {
      if (decodedToken) {
        request.userInfo = decodedToken;
        next();
      } else if (error.name === 'TokenExpiredError') {
        next(Boom.unauthorized('Token Expired'));
      } else {
        next(Boom.unauthorized('Invalid Token'));
      }
    });
  } else {
    next(Boom.notAcceptable('Bad Request'));
  }
}

/**
 * Validate refresh token.
 *
 * @param  {object}   request
 * @param  {object}   response
 * @param  {function} next
 * @return {Promise}
 */
export function validateRefreshToken(request, response, next) {
  if ('authorization' in request.headers) {
    let refreshToken = request.headers.authorization.substring(7);
    new Token().where({ refresh: refreshToken }).count('refresh').then(count => {
      if (count > 0) {
        jwt.verify(refreshToken, auth.refreshTokenSalt, (error, decodedToken) => {
          if (decodedToken) {
            request.userInfo = decodedToken;
            next();
          } else if (error.name === 'TokenExpiredError') {
            next(Boom.unauthorized('Token Expired'));
          } else {
            next(Boom.unauthorized('Invalid Token'));
          }
        });
      } else {
        next(Boom.unauthorized('Invalid Token'));
      }
    });
  } else {
    next(Boom.notAcceptable('Bad Request'));
  }
}
