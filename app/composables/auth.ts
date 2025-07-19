export function useAuth() {
	const user = ref(null);
	const isAuthenticated = ref(false);

	function login(username, password) {
		// Simulate an API call
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				if (username === 'user' && password === 'pass') {
					user.value = { username };
					isAuthenticated.value = true;
					resolve(user.value);
				} else {
					reject(new Error('Invalid credentials'));
				}
			}, 1000);
		});
	}

	function logout() {
		user.value = null;
		isAuthenticated.value = false;
	}

	return {
		user,
		isAuthenticated,
		login,
		logout,
	};
}
