// ==========================================
// CONTROL DE GLUCOSA
// SERVICE WORKER
// ==========================================

const CACHE_NAME = "control-glucosa-v1";


// ==========================================
// ARCHIVOS PRINCIPALES
// ==========================================

const ARCHIVOS = [

    "./",

    "./index.html",

    "./manifest.json",

    "./css/style.css",

    "./js/app.js"

];


// ==========================================
// INSTALACIÓN
// ==========================================

self.addEventListener(
    "install",
    function(event) {

        console.log(
            "PWA: instalando..."
        );


        event.waitUntil(

            caches.open(
                CACHE_NAME
            )
            .then(function(cache) {

                return cache.addAll(
                    ARCHIVOS
                );

            })

        );


        self.skipWaiting();

    }
);


// ==========================================
// ACTIVACIÓN
// ==========================================

self.addEventListener(
    "activate",
    function(event) {

        console.log(
            "PWA: activada"
        );


        event.waitUntil(

            caches.keys()
                .then(function(cacheNames) {

                    return Promise.all(

                        cacheNames.map(
                            function(cacheName) {

                                if (
                                    cacheName !==
                                    CACHE_NAME
                                ) {

                                    return caches.delete(
                                        cacheName
                                    );

                                }

                            }
                        )

                    );

                })

        );


        self.clients.claim();

    }
);


// ==========================================
// INTERCEPTAR PETICIONES
// ==========================================

self.addEventListener(
    "fetch",
    function(event) {

        event.respondWith(

            fetch(event.request)
                .then(function(response) {

                    return response;

                })
                .catch(function() {

                    return caches.match(
                        event.request
                    );

                })

        );

    }
);