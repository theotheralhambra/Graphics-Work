#version 330 compatibility

in vec4  vColor;
in float vLightIntensity;
in vec2  vST;
in vec3	 vMCposition;
in float vZ;

uniform bool  uSmooth;
uniform bool  uUseChromaDepth;
uniform float uChromaRed;
uniform float uChromaBlue;
uniform float uAd;
uniform float uBd;
uniform float uTol;
uniform vec4  uDotColor;
uniform float uNoiseFreq;
uniform float uNoiseAmp;
uniform float uAlpha;
uniform sampler3D Noise3;

vec4 ChromaDepth( float t ){
	t = clamp( t, 0., 1. );

	float r = 1.;
	float g = 0.0;
	float b = 1.  -  6. * ( t - (5./6.) );

        if( t <= (5./6.) ){
                r = 6. * ( t - (4./6.) );
                g = 0.;
                b = 1.;
        }

        if( t <= (4./6.) ){
                r = 0.;
                g = 1.  -  6. * ( t - (3./6.) );
                b = 1.;
        }

        if( t <= (3./6.) ){
                r = 0.;
                g = 1.;
                b = 6. * ( t - (2./6.) );
        }

        if( t <= (2./6.) ){
                r = 1.  -  6. * ( t - (1./6.) );
                g = 1.;
                b = 0.;
        }

        if( t <= (1./6.) ){
                r = 1.;
                g = 6. * t;
        }

	return vec4( r, g, b, 1. );
}

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
	n = n - 2.;                             					// -1. -> 1.
	float delta = uNoiseAmp * n;
	
	float sc = float(num_in_s) * uAd + Ar;
	float ds = sp - sc;                   	// wrt ellipse center
	float tc = float(num_in_t) * uBd + Br;
	float dt = tp - tc;                   	// wrt ellipse center
	
	float oldDist = sqrt( ds*ds + dt*dt );
	float newDist = oldDist + delta;
	float scale = newDist / oldDist;        // this could be < 1., = 1., or > 1.
	
	ds *= scale;                            // scale by noise factor
	ds /= Ar;                               // ellipse equation

	dt *= scale;                            // scale by noise factor
	dt /= Br;                               // ellipse equation
	
	float inside = pow(ds,2)+pow(dt,2);// + dt*dt;//pow( (sp - sc) / Ar, 2) + pow( (tp - tc) / Br, 2);	//figure out where we are
	
	gl_FragColor = vColor;										// default color
	
	if( uSmooth ) {
		if(inside <= 1. + uTol) {
			float blend = smoothstep( 1.-uTol, 1.+uTol, inside);
			vec4 borderColor = vColor;
			borderColor.a = uAlpha;
			if( uUseChromaDepth ) {
				float t = (2./3.) * ( vZ - uChromaRed ) / ( uChromaBlue - uChromaRed );
				t = clamp( t, 0., 2./3. );
				gl_FragColor = mix( ChromaDepth( t ), borderColor, blend );
			} else {
				gl_FragColor = mix( uDotColor, borderColor, blend );
			}
		} else {
			if( uAlpha == 0) {
				discard;
			} else {
				gl_FragColor.a = uAlpha;
			}
		}
	} else {
		if( inside <= 1. ) {
			if( uUseChromaDepth ) {
				float t = (2./3.) * ( vZ - uChromaRed ) / ( uChromaBlue - uChromaRed );
				t = clamp( t, 0., 2./3. );
				gl_FragColor = ChromaDepth( t );
			} else {
				gl_FragColor = uDotColor;
			}
		} else {
			if( uAlpha == 0) {
				discard;
			} else {
				gl_FragColor.a = uAlpha;
			}
		}
	}

	gl_FragColor.rgb *= vLightIntensity;	// apply lighting model
}
