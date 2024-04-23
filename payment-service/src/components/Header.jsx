import { useLocation } from 'preact-iso';

export function Header() {
	const { url } = useLocation();

	return (
		<header>
			<nav>
				<a href="/" class={url == '/' && 'active'}>
					Home
				</a>
				<a href="/register" class={url == '/register' && 'active'}>
					Register
				</a>
			</nav>
		</header>
	);
}
