import { Express } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { SequelizeRepository } from "../../repository/user-metadata/sequelize-user-metadata.repository";
import { UserMetadataUseCase } from "../../../application/user-metadata/user-metadata-use-case";
import { UserMetadataController } from "../../controller/user-metadata/user-metadata.controller";
import SocketAdapter from "../../services/socketAdapter";

function configureUserMetadataRoutes(app: Express, socketAdapter?: SocketAdapter) {
    const sequelizeUserMetadataRepository = new SequelizeRepository();
    const userMetadataUseCase = new UserMetadataUseCase(sequelizeUserMetadataRepository);
    const userMetadataCtrl = new UserMetadataController(userMetadataUseCase);

    app.get(`/${process.env.BASE_URL_API}/user-metadata/:usr_uuid`, authMiddleware, userMetadataCtrl.getByUserCtrl);
    app.get(`/${process.env.BASE_URL_API}/user-metadata/:usr_uuid/:usrmd_key`, authMiddleware, userMetadataCtrl.getByKeyCtrl);
    app.post(`/${process.env.BASE_URL_API}/user-metadata`, authMiddleware, userMetadataCtrl.setCtrl);
    app.delete(`/${process.env.BASE_URL_API}/user-metadata/:usr_uuid/:usrmd_key`, authMiddleware, userMetadataCtrl.deleteCtrl);
}

export default configureUserMetadataRoutes;
