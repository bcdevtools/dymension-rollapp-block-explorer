import appLogo from '../../assets/preact.svg';
import './style.css';

export function Home() {
	return (
		<div class="home">
			<a href="https://dym.fyi.com/dr" target="_blank">
				<img src={appLogo} alt="logo" height="160" width="160" />
			</a>
			<h1>Let cryptonian all over the world exporing your RollApp!</h1>
			<section>
				<Resource
					title="Register your RollApp now!"
					description="Register your RollApp to Dymension RollApps Block Explorer, invite more users to explore your RollApp!"
					href="/register"
				/>
				<Resource
					title="Earn Dr.BE token"
					description="Dr.BE token is used for registration, unlocking features. Free to earn by delegating to our validator!"v
					href="https://forum.dymension.xyz/t/introducing-block-explorer-project-for-rollapps/3292"
				/>
				<Resource
					title="..."
					description="..."
					href="#"
				/>
			</section>
		</div>
	);
}

function Resource(props) {
	return (
		<a href={props.href} target="_blank" class="resource">
			<h2>{props.title}</h2>
			<p>{props.description}</p>
		</a>
	);
}
