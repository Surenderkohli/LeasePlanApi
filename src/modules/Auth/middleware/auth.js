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

               // req.user = await User.findById(decoded.id).select('-password');
               // req.roles = decoded.roles; // Adds the decoded role to the request object

               // Check if user has the same id as the requested profile, or if the user has admin privileges
               if (decoded.id === req.params.id || decoded.roles === 'admin') {
                    req.user = await User.findById(decoded.id).select(
                         '-password'
                    );
                    req.roles = decoded.roles;

                    next();
               } else {
                    res.send({
                         status: 403,
                         success: false,
                         msg: 'Forbidden, user is not authorized to access this profile',
                    });
               }

               //next()
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

const isAdmin = (req, res, next) => {
     if (req.roles === 'admin') {
          next();
     } else {
          res.send({
               status: 403,
               success: false,
               msg: 'Forbidden, user is not an admin',
          });
     }
};

export { protect, isAuthenticated, isAdmin };
