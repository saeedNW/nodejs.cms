/** import main middleware file */
const Middleware = require("./middleware");
/** import permission constants */
const {permissionsConstants} = require("../constants");

class PermissionGuard extends Middleware {
    /**
     * check if user has a required role for accessing to the route
     * @param {[]} requiredPermissions required permissions for accessing to the route
     * @return {(function(*, *, *): (*|undefined))|*}
     */
    permissionGuard(requiredPermissions = []) {
        return async (req, res, next) => {
            try {
                /**
                 * get user info from request.
                 * populate with user roles
                 */
                const user = await req.user.populate({
                    path: "role",
                    /**
                     * populate roles with role permissions
                     */
                    populate: {
                        path: "permissions"
                    }
                });

                /**
                 * throw error if user doesn't have any roles
                 */
                if (!user.role)
                    this.sendError("شما اجازه دسترسی به این بخش را ندارید", 403);

                /**
                 * get user access permissions title as an array
                 * @type {*[]}
                 */
                const userPermissions = user.role.permissions.map(permission => permission.title);

                /**
                 * check if user has the required permission
                 * @type {boolean[]}
                 */
                const hashPermission = requiredPermissions.map(permission => {
                    return userPermissions.includes(permission);
                });

                /**
                 * let user access to the route if he has full access
                 */
                if (userPermissions.includes(permissionsConstants.AccessPermissions.fullAccess))
                    return next();

                /**
                 * let user access to the route if
                 * he has the required permission
                 * or if the route didn't require any
                 * permission to gain access to it
                 */
                if (requiredPermissions.length === 0 || hashPermission.includes(true))
                    return next();

                /**
                 * throw error if user doesn't have the required permission
                 */
                this.sendError("شما اجازه دسترسی به این بخش را ندارید", 403);
            } catch (err) {
                next(err);
            }
        }
    }
}

module.exports = new PermissionGuard();