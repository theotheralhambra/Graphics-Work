uniform vec4	uColor;
uniform bool	uSilh;


void
main( )
{
	if( ! uSilh )
		discard;

	gl_FragColor = vec4( uColor.rgb, 1. );
}
