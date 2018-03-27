#version 330 compatibility

in vec4  vColor;
in float vLightIntensity;
in vec2  vST;

uniform bool  uSmooth;
uniform float uAd;
uniform float uBd;
uniform float uTol;
uniform vec4  uDotColor;
uniform sampler3D Noise3;

void main() {
	float s = vST.s;
	float t = vST.t;
	float sp = 2. * s;			// good for spheres
	float tp = t;
		
	float Ar = uAd / 2;
	float Br = uBd / 2;
	float maxRad = max( Ar, Br );								//must determine higher of two to prevent banding effect
	int num_in_s = int( sp / uAd );
	int num_in_t = int( tp / uBd );
	float sc = float(num_in_s) * uAd + Ar;
	float tc = float(num_in_t) * uBd + Br;

	gl_FragColor = vColor;		// default color
	
	float inside = pow( (sp - sc) / Ar, 2) + pow( (tp - tc) / Br, 2);	//figure out where we are

	
	if( uSmooth ) {
		if(inside <= 1. + uTol) {
			float blend = smoothstep( 1.-uTol, 1.+uTol, inside);//test);
			gl_FragColor = mix( uDotColor, vColor, blend );
		}
	} else {
		if( inside <= 1. ) {
			gl_FragColor = uDotColor;
		}
	}

	gl_FragColor.rgb *= vLightIntensity;	// apply lighting model
}
