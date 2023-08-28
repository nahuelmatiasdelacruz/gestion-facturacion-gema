const {Router} = require("express");
const router = Router();
const clientsControllers = require("../controllers/clientsControllers");
const { validarJwt } = require("../middlewares/validarJwt");
const { validarCampos } = require("../middlewares/validarCampos");

router.get("/",[validarJwt,validarCampos],clientsControllers.getClients);
router.get("/cuits/all",[validarJwt,validarCampos],clientsControllers.getClientCuits);
router.get("/data",[validarJwt,validarCampos],clientsControllers.getClientById);
router.get("/rolecheck/check",[validarJwt,validarCampos],clientsControllers.checkRole);
router.get("/photo/getPhoto",[validarJwt,validarCampos],clientsControllers.getPhotoById);
router.post("/photo/changeProfilePhoto",[validarJwt,validarCampos],clientsControllers.setProfilePhoto);
router.post("/",[validarJwt,validarCampos],clientsControllers.addClient);
router.delete("/:id",[validarJwt,validarCampos],clientsControllers.deleteClient);
router.put("/",[validarJwt,validarCampos],clientsControllers.updateClient);

module.exports = router;