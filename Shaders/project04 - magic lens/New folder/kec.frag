#version 330 compatibility

uniform sampler2D uTexUnit;

in vec2 vST;

void
main( )
{
	//vec2 delta = vST - vec2(uS0,uT0);

	//vec2 st = vec2(uS0,uT0) + sign(delta) * pow( abs(delta), vec2(uPower) );

	vec3 rgb = texture2D( uTexUnit, vST ).rgb;

	gl_FragColor = vec4( rgb, 1. );
}
