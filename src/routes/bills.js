const {Router} = require("express");
const router = Router();
const { validarJwt } = require("../middlewares/validarJwt");
const { validarCampos } = require("../middlewares/validarCampos");
const billsControllers = require("../controllers/billsControllers");

router.get("/download/failed/:id",[validarJwt,validarCampos],billsControllers.downloadFailed);
router.get("/download/:id",[validarJwt,validarCampos],billsControllers.downloadBill);
router.get("/",[validarJwt,validarCampos],billsControllers.getBills);
router.get("/pending/cant",[validarJwt,validarCampos],billsControllers.getPending);
router.get("/:id",[validarJwt,validarCampos],billsControllers.getBillById);
router.post("/check/startcheck",[validarJwt,validarCampos],billsControllers.startCheck);
router.post("/",[validarJwt,validarCampos],billsControllers.addBill);
router.post("/check",[validarJwt,validarCampos],billsControllers.checkBills);
router.delete("/pending/:id",[validarJwt,validarCampos],billsControllers.deletePending);
router.delete("/:id",[validarJwt,validarCampos],billsControllers.deleteBill);
router.post("/pending",[validarJwt,validarCampos],billsControllers.editarPendiente);
router.put("/",[validarJwt,validarCampos],billsControllers.updateBill);

module.exports = router;