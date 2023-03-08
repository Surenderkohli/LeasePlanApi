import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const protect = async (req, res, next) => {
     let token;

     if (
          req.headers.authorization &&
          req.headers.authorization.startsWith('Bearer')
     ) {
          try {
               token = req.headers.authorization.split(' ')[1];

               //decodes token id
               const decoded = jwt.verify(token, process.env.JWT_SECRET);

               req.user = await User.findById(decoded.id).select('-password');

               next();
          } catch (error) {
               res.send({
                    status: 400,
                    success: false,
                    msg: 'Not authorized, token failed',
               });
          }
     }
     if (!token) {
          res.send({
               status: 400,
               success: false,
               msg: 'Not authorized, no token',
          });
     }
};

//custom middlewares
const isAuthenticated = async (req, res, next) => {
     let checker = req.profile && req.auth && req.profile._id === req.auth._id;
     if (!checker) {
          return res.status(403).json({
               error: 'ACCESS DENIED',
          });
     }
     next();
};

const isAdmin = async (req, res, next) => {
     if (!req.profile.roles === 'admin') {
          return res.status(403).json({
               error: 'You are not ADMIN, Access denied',
          });
     }
     next();
};
export { protect, isAuthenticated, isAdmin };
