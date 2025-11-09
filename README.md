# Agora API
API Client for Agora Web App

## Useful Links  
- [Final Pitch](https://docs.google.com/presentation/d/1HXKqmsZyCMxQtghUePKEA-U3StOZPRZcw0MA3GHpHi8/edit?usp=sharing)
- [Demo Video](https://drive.google.com/file/d/1naexVmnWrv0L6NdkERBsKv2V_-4Mp60w/view?usp=sharing)

### How it works

Open Payments implementation its under POST /api/commit resource.

Firts, we create a Future Outgoing Payment Grant until some operational platform conditions success. Then it uses the future grant to outgoing payment perform.


### How to run locally

1. Run `npm install`
2. Download secret files from [Google Drive](https://drive.google.com/drive/folders/1JFmFSCbs51NpOCWNBQM5FzUYX_3Tgo14?usp=sharing)
3. Put private.key file in root
4. Put agora{...}.json file under src/config/
5. Run `npm run dev` to start server, by default runing on port 4000.
6. Optionally, import requests/Hackaton.postman_collection.json file in postman to see collections

Note: Make sure running locally both projects: API Cliente and [Web App Cliente](https://github.com/IrvingSanchez/Agora-Web)

### Team members

* _>[Miguel Zavala](https://github.com/inatento)<_
* _>[Fredy Nazario](https://github.com/7yderf)<_
* _>[Irving Sánchez](https://github.com/IrvingSanchezConecta)<_

### What comes next?

We will complete the project after Hackathon :)

