import jwt from 'jsonwebtoken';
import userModel from '../models/user.js';

const protect = async (req, res, next) => {
     try {
          const authHeader = req.headers.authorization;

          if (!authHeader || !authHeader.startsWith('Bearer')) {
               return res.status(401).json({
                    error: 'Unauthorized: Invalid or missing Authorization token',
               });
          }

          const token = authHeader.split(' ')[1];

          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          req.auth = decoded;

          const user = await userModel.findById(decoded.id).select('-password');
          if (!user) {
               return res.status(401).json({ error: 'Unauthorized' });
          }

          if (
               user._id.toString() === req.params.id ||
               decoded.roles === 'admin'
          ) {
               req.user = user;
               req.roles = decoded.roles;
               next();
          } else {
               return res.status(403).json({
                    error: 'Access Forbidden: You are not authorized to access this profile.',
               });
          }
     } catch (error) {
          return res.status(401).json({ error: 'Unauthorized' });
     }
};

//custom middlewares
const isAuthenticated = async (req, res, next) => {
     const { user, auth } = req;
     if (!(user && auth && user.id === auth.id)) {
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
