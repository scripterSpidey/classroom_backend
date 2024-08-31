import express from "express";
import { AdminRepo } from "../../infrastructure/repositories/admin.repo";
import { AdminInteractor } from "../../application/interactor/admin.interactor";
import { AdminGateway } from "../../presentation/gateway/admin.gateway";
import { JWT } from "../../application/service/jwt";
import { AdminAuthMiddleware } from "../middleware/admin.auth.middleware";

const router = express.Router();

const jwt = new JWT();

const adminAuthMiddleware = new AdminAuthMiddleware(jwt)
const adminRepo = new AdminRepo();
const adminInteractor = new AdminInteractor(adminRepo, jwt);
const adminGateway = new AdminGateway(adminInteractor);

router.post('/login', adminGateway.onLogin.bind(adminGateway));


router.use(adminAuthMiddleware.authenticateAdmin.bind(adminAuthMiddleware))

router.route('/teachers')
    .get(adminGateway.onGetTeachers.bind(adminGateway));

router.route('/teacher/:teacherId')
    .get(adminGateway.onGetTeacherInfo.bind(adminGateway))
    .patch(adminGateway.onBLockTeacher.bind(adminGateway))

router.route('/students')
    .get(adminGateway.onGetStudents.bind(adminGateway));

router.route('/student/:studentId')
    .get(adminGateway.onGetStudentInfo.bind(adminGateway))
    .patch(adminGateway.onBlockOrUnblockStudent.bind(adminGateway))

router.route('/classrooms')
    .get(adminGateway.onGetClassrooms.bind(adminGateway));

router.route('/classroom/:classroomId')
    .get(adminGateway.onGetClassroomInfo.bind(adminGateway))
    .patch(adminGateway.onBanOrUnbanClassroom.bind(adminGateway))


export default router;