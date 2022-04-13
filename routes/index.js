const authRouter = require('./authRouter');
const userRouter = require('./userRouter');
const secondaryAuthRouter = require('./secondaryAuthRouter');
const carrierRouter = require('./carrierRouter');
const adminRouter = require('./adminRouter');
const authPageRouter =require('./authPageRouter');

const router = require('express').Router();

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/secondary-auth', secondaryAuthRouter)
router.use('/carrier', carrierRouter);
router.use('/admin', adminRouter);
router.use('/vboms-auth', authPageRouter);

module.exports = router