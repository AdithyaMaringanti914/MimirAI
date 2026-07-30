import { Router } from 'express';
import * as controller from '../controllers/deviceController';
import { validate } from '../middleware/validate';
import { registerDeviceSchema, heartbeatSchema, rotatePasswordSchema } from '../types/schemas';

const router = Router();

router.post('/register', validate(registerDeviceSchema), controller.registerDevice);
router.post('/heartbeat', validate(heartbeatSchema), controller.heartbeat);
router.post('/password', validate(rotatePasswordSchema), controller.rotatePassword);

router.get('/recent', controller.getRecentDevices);
router.get('/:deviceId', controller.getDevice);

export default router;
