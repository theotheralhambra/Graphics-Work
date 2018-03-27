#version 330 compatibility

in vec4  vColor;
in float vLightIntensity;
in vec2  vST;
in vec3	vMCposition;

uniform bool  uSmooth;
uniform float uAd;
uniform float uBd;
uniform float uTol;
uniform vec4  uDotColor;
uniform float uNoiseFreq;
uniform float uNoiseAmp;
uniform float uAlpha;
uniform sampler3D Noise3;

void main() {
	float s = vST.s;
	float t = vST.t;
	float sp = 2. * s;											// good for spheres
	float tp = t;
	float Ar = uAd / 2;
	float Br = uBd / 2;
	int num_in_s = int( sp / uAd );
	int num_in_t = int( tp / uBd );
	vec4 nv  = texture3D( Noise3, uNoiseFreq*vMCposition );
	float n = nv.r + nv.g + nv.b + nv.a;    					//  1. -> 3.
	//n = fract(n - 2.);                             					// -1. -> 1.
	n = fract(( n - 1. ) / 2.);
	
	float sc = float(num_in_s) * uAd + Ar;
	float ds = sp - sc;                   // wrt ellipse center
	float tc = float(num_in_t) * uBd + Br;
	float dt = tp - tc;                   // wrt ellipse center
	
	float oldDist = length(vec2(ds,dt));//sqrt( ds*ds + dt*dt );
	float newDist = oldDist * n;//<< use the noise value >>
	float scale = newDist / oldDist;        // this could be < 1., = 1., or > 1.
	
	ds *= scale;                            // scale by noise factor
	ds /= Ar;                               // ellipse equation

	dt *= scale;                            // scale by noise factor
	dt /= Br;                               // ellipse equation
	
	float inside = pow(ds,2)+pow(dt,2);// + dt*dt;//pow( (sp - sc) / Ar, 2) + pow( (tp - tc) / Br, 2);	//figure out where we are
	inside += uNoiseAmp;
	
	gl_FragColor = vColor;										// default color
	
	if( uSmooth ) {
		if(inside <= 1. + uTol) {
			float blend = smoothstep( 1.-uTol, 1.+uTol, inside);//test);
			gl_FragColor = mix( uDotColor, vColor, blend );
		} else {
			if( uAlpha == 0) {
				discard;
			} else {
				gl_FragColor.a = uAlpha;
			}
		}
	} else {
		if( inside <= 1. ) {
			gl_FragColor = uDotColor;
		}
		else {
			if( uAlpha == 0) {
				discard;
			} else {
				gl_FragColor.a = uAlpha;
			}
		}
	}

	gl_FragColor.rgb *= vLightIntensity;	// apply lighting model
}
