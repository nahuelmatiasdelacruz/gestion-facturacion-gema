const {Router} = require("express");
const router = Router();
const usersControllers = require("../controllers/usersControllers");
const { validarJwt } = require("../middlewares/validarJwt");
const { validarCampos } = require("../middlewares/validarCampos");

router.get("/getPhoto",[validarJwt,validarCampos],usersControllers.getPhotoById);
router.get("/",[validarJwt,validarCampos],usersControllers.getUsers);
router.get("/data",[validarJwt,validarCampos],usersControllers.getUserById); // Con el bearer
router.post("/",[validarJwt,validarCampos],usersControllers.addUser);
router.post("/changeProfilePhoto",[validarJwt,validarCampos],usersControllers.setProfilePhoto);
router.delete("/:id",[validarJwt,validarCampos],usersControllers.deleteUser);
router.put("/",[validarJwt,validarCampos],usersControllers.updateUser);
router.put("/photo",[validarJwt,validarCampos],usersControllers.updatePhoto);

module.exports = router;