// ============================================
// FUNCIONES DE BÚSQUEDA DE USUARIOS
// ============================================

let searchTimeout = null;

/**
 * Busca usuarios por email en Firestore
 */
window.searchUsers = async function (searchTerm) {
    const resultsContainer = document.getElementById('search-results-container');
    const resultsDiv = document.getElementById('search-results');
    const loadingDiv = document.getElementById('search-loading');

    // Limpiar timeout anterior
    if (searchTimeout) clearTimeout(searchTimeout);

    // Si el término de búsqueda está vacío, ocultar resultados
    if (!searchTerm || searchTerm.length < 3) {
        resultsContainer.style.display = 'none';
        return;
    }

    // Mostrar loading
    loadingDiv.style.display = 'block';
    resultsContainer.style.display = 'none';

    // Debounce: esperar 500ms antes de buscar
    searchTimeout = setTimeout(async () => {
        try {
            const usersRef = collection(db, 'users');
            const q = query(
                usersRef,
                where('email', '>=', searchTerm.toLowerCase()),
                where('email', '<=', searchTerm.toLowerCase() + '\uf8ff')
            );

            const snapshot = await getDocs(q);
            const users = [];

            snapshot.forEach((doc) => {
                const userData = doc.data();
                users.push({
                    uid: doc.id,
                    email: userData.email,
                    displayName: userData.displayName || userData.email.split('@')[0]
                });
            });

            // Ocultar loading
            loadingDiv.style.display = 'none';

            // Mostrar resultados
            if (users.length > 0) {
                resultsContainer.style.display = 'block';
                resultsDiv.innerHTML = users.map(user => `
                    <div style="padding:12px; border-bottom:1px solid var(--separator-color); cursor:pointer; display:flex; align-items:center; gap:12px; transition: background 0.2s;"
                        onmouseover="this.style.background='var(--input-bg)'"
                        onmouseout="this.style.background='transparent'"
                        onclick="selectUserFromSearch('${user.email}', '${user.displayName}')">
                        <div class="avatar-circle" style="width:32px; height:32px; font-size:14px;">
                            ${user.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div style="flex:1;">
                            <div style="font-weight:600; font-size:14px;">${user.displayName}</div>
                            <div style="font-size:12px; color:var(--text-subtle);">${user.email}</div>
                        </div>
                    </div>
                `).join('');
            } else {
                resultsContainer.style.display = 'block';
                resultsDiv.innerHTML = `
                    <div style="padding:20px; text-align:center; color:var(--text-subtle);">
                        <i class="fas fa-user-slash" style="font-size:32px; margin-bottom:8px;"></i>
                        <div>No se encontraron usuarios</div>
                    </div>
                `;
            }

        } catch (error) {
            console.error('Error buscando usuarios:', error);
            loadingDiv.style.display = 'none';
            resultsContainer.style.display = 'block';
            resultsDiv.innerHTML = `
                <div style="padding:20px; text-align:center; color:#ff5252;">
                    <i class="fas fa-exclamation-triangle" style="font-size:32px; margin-bottom:8px;"></i>
                    <div>Error al buscar usuarios</div>
                </div>
            `;
        }
    }, 500);
};

/**
 * Selecciona un usuario de los resultados de búsqueda
 */
window.selectUserFromSearch = async function (email, displayName) {
    const user = auth.currentUser;
    if (!user || !currentBoardId) return;

    try {
        // Obtener el tablero actual
        const boardRef = doc(db, 'users', user.uid, 'boards', currentBoardId);
        const boardSnap = await getDoc(boardRef);

        if (!boardSnap.exists()) {
            alert('Tablero no encontrado');
            return;
        }

        const boardData = boardSnap.data();
        const currentMembers = boardData.members || [];

        // Verificar si el usuario ya es miembro
        if (currentMembers.includes(email)) {
            alert(`${displayName} ya es miembro de este tablero`);
            return;
        }

        // Agregar el nuevo miembro
        await updateDoc(boardRef, {
            members: [...currentMembers, email]
        });

        // Limpiar búsqueda
        document.getElementById('member-search-input').value = '';
        document.getElementById('search-results-container').style.display = 'none';

        // Actualizar lista de miembros
        displayCurrentMembers();

        alert(`${displayName} ha sido agregado al tablero`);

    } catch (error) {
        console.error('Error agregando miembro:', error);
        alert('Error al agregar miembro');
    }
};

/**
 * Muestra los miembros actuales del tablero
 */
async function displayCurrentMembers() {
    const container = document.getElementById('current-members-list');
    const user = auth.currentUser;

    if (!user || !currentBoardId) return;

    try {
        const boardRef = doc(db, 'users', user.uid, 'boards', currentBoardId);
        const boardSnap = await getDoc(boardRef);

        if (!boardSnap.exists()) return;

        const members = boardSnap.data().members || [];

        if (members.length === 0) {
            container.innerHTML = '<div style="padding:12px; text-align:center; color:var(--text-subtle);">No hay participantes</div>';
            return;
        }

        container.innerHTML = members.map(memberEmail => {
            const displayName = memberEmail.split('@')[0];
            const initial = displayName.charAt(0).toUpperCase();
            const isOwner = memberEmail === user.email;

            return `
                <div style="padding:12px; border-bottom:1px solid var(--separator-color); display:flex; align-items:center; gap:12px;">
                    <div class="avatar-circle" style="width:32px; height:32px; font-size:14px;">
                        ${initial}
                    </div>
                    <div style="flex:1;">
                        <div style="font-weight:600; font-size:14px;">${displayName}</div>
                        <div style="font-size:12px; color:var(--text-subtle);">${memberEmail}</div>
                    </div>
                    ${isOwner ? '<span style="font-size:12px; color:var(--btn-primary); font-weight:600;">Propietario</span>' : ''}
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Error cargando miembros:', error);
    }
}

// ============================================
// FUNCIONES DE NOTIFICACIONES PUSH (FCM)
// ============================================

/**
 * Crea o actualiza el perfil del usuario en Firestore
 */
async function createOrUpdateUserProfile(user) {
    try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email.split('@')[0],
            photoURL: user.photoURL || null,
            lastLogin: new Date()
        }, { merge: true });

        console.log('Perfil de usuario actualizado');
    } catch (error) {
        console.error('Error actualizando perfil:', error);
    }
}

/**
 * Inicializa las notificaciones push
 */
async function initializePushNotifications(user) {
    try {
        // Verificar si el navegador soporta notificaciones
        if (!('Notification' in window)) {
            console.log('Este navegador no soporta notificaciones');
            return;
        }

        // Verificar si ya se otorgaron permisos
        if (Notification.permission === 'granted') {
            await registerFCMToken(user);
        } else if (Notification.permission !== 'denied') {
            // Solicitar permisos
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                await registerFCMToken(user);
            }
        }

        // Escuchar mensajes en primer plano
        onMessage(messaging, (payload) => {
            console.log('Mensaje recibido en primer plano:', payload);

            const notificationTitle = payload.notification.title || 'Trello Clone';
            const notificationOptions = {
                body: payload.notification.body || 'Tienes una nueva notificación',
                icon: 'https://cdn-icons-png.flaticon.com/512/616/616430.png',
                badge: 'https://cdn-icons-png.flaticon.com/512/616/616430.png',
                tag: payload.data?.tag || 'default',
                requireInteraction: false
            };

            new Notification(notificationTitle, notificationOptions);
        });

    } catch (error) {
        console.error('Error inicializando notificaciones:', error);
    }
}

/**
 * Registra el token FCM del usuario
 */
async function registerFCMToken(user) {
    try {
        const token = await getToken(messaging, {
            vapidKey: 'BKPyjcfjys22vB78MoMJ9nFXkV6TL6XreQXOo9rSSJkbahKRB4Y6bYjQrl-Zjs_kCdzuj66Egp4_R_mhdd6a-OA' // Deberás generar esto en Firebase Console
        });

        if (token) {
            // Guardar token en Firestore
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                fcmToken: token,
                fcmTokenUpdatedAt: new Date()
            });

            console.log('Token FCM registrado:', token);
        }
    } catch (error) {
        console.error('Error obteniendo token FCM:', error);
    }
}

/**
 * Envía una notificación a un usuario
 */
window.sendNotificationToUser = async function (recipientEmail, title, body, data = {}) {
    try {
        // Buscar el usuario por email
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', recipientEmail));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.log('Usuario no encontrado');
            return;
        }

        const recipientId = snapshot.docs[0].id;

        // Llamar a la Cloud Function
        const sendNotification = httpsCallable(functions, 'sendNotification');
        const result = await sendNotification({
            recipientId: recipientId,
            title: title,
            body: body,
            data: data
        });

        console.log('Notificación enviada:', result.data);
        return result.data;

    } catch (error) {
        console.error('Error enviando notificación:', error);
        throw error;
    }
};
