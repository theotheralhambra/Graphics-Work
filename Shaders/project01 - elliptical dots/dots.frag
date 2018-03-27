#version 330 compatibility

in vec4  vColor;
in float vLightIntensity;
in vec2  vST;

uniform bool  uSmooth;
uniform float uAd;
uniform float uBd;
uniform float uTol;
uniform vec4  uDotColor;

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

	if( pow( (sp - sc) / Ar, 2) + pow( (tp - tc) / Br, 2) <= 1. ) {
		if( uSmooth ) {
			float ds = abs(sp - sc);			
			float dt = abs(tp - tc);			
			float maxDist = max( ds, dt  );						
			float b = smoothstep( maxRad-uTol, maxRad+uTol, maxDist );
			gl_FragColor = mix( uDotColor, vColor, b );
			gl_FragColor.rgb *= vLightIntensity;
		} else {
			gl_FragColor = uDotColor;
		}
	}

	gl_FragColor.rgb *= vLightIntensity;	// apply lighting model
}
