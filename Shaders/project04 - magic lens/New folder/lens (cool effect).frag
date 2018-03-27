#version 330 compatibility

uniform sampler2D uTexUnit;
uniform float uScenter;
uniform float uTcenter;
uniform float uRadius;
uniform float uMagFactor;
uniform float uRotAngle;
uniform float uSharpFactor;

in vec2 vST;

vec2 dimensions = textureSize(uTexUnit, 0);
float sizeS = dimensions.s;
float sizeT = dimensions.t;

vec2 magnifyImage( float sOffset, float tOffset ) {
	// remove the separation between pt and center of lens, 
	// then add back that distance adjusted for magnification
    // (divide produces magnification)
	return vec2(vST.s - sOffset + (sOffset / uMagFactor) , vST.t - tOffset + (tOffset / uMagFactor) );
}

vec2 rotateImage( vec2 currST, float sOffset, float tOffset, float sDist, float tDist ) {
	//float beta = atan(tOffset, sOffset) + uRotAngle;
	//return vec2( cos(beta), sin(beta) );
	
	//works except offsets
	//float s1 = currST.s*cos(uRotAngle) - currST.t*sin(uRotAngle);
	//float t1 = currST.s*sin(uRotAngle) + currST.t*cos(uRotAngle);
	//return vec2(s1, t1);

	//float sDist = currST.s - sOffset;
	//float tDist = currST.t - tOffset;
	
	float s1 = sDist*cos(uRotAngle) - tDist*sin(uRotAngle);
	float t1 = sDist*sin(uRotAngle) + tDist*cos(uRotAngle);
	return vec2(s1+sOffset, t1+tOffset);
	
}

vec3 sharpenImage( vec3 irgb, vec2 currST, float ResS, float ResT ) {
	
	vec2 stp0  = vec2( 1. / ResS,  0. ); 
	vec2 st0p  = vec2( 0.,  1. / ResT ); 
	vec2 stpp  = vec2( 1. / ResS,  1. / ResT ); 
	vec2 stpm  = vec2( 1. / ResS, -1. / ResT ); 
	vec3 i00   = texture2D( uTexUnit, currST ).rgb; 
	vec3 im1m1 = texture2D( uTexUnit, currST - stpp ).rgb; 
	vec3 ip1p1 = texture2D( uTexUnit, currST + stpp ).rgb; 
	vec3 im1p1 = texture2D( uTexUnit, currST - stpm ).rgb; 
	vec3 ip1m1 = texture2D( uTexUnit, currST + stpm ).rgb; 
	vec3 im10  = texture2D( uTexUnit, currST - stp0 ).rgb; 
	vec3 ip10  = texture2D( uTexUnit, currST + stp0 ).rgb; 
	vec3 i0m1  = texture2D( uTexUnit, currST - st0p ).rgb; 
	vec3 i0p1  = texture2D( uTexUnit, currST + st0p ).rgb; 
	vec3 target = vec3(0.,0.,0.); 
	target += 1. * ( im1m1 + ip1m1 + ip1p1  + im1p1 ); 
	target += 2. * ( im10 + ip10 + i0m1 + i0p1 ); 
	target += 4. * ( i00 ); target /= 16.; 
	return vec3( mix( target, irgb, uSharpFactor ) );
}

void main() {
	
	vec3 rgb;
	vec2 newST;
	float a = vST.s - uScenter;
	float a1 = uScenter - vST.s;
	float a2 = pow( a, 2);
	float b = vST.t - uTcenter;
	float b1 = uTcenter - vST.t;
	float b2 = pow( b, 2);
	float c2 = a2 + b2;
	float r2 = pow(uRadius, 2);

	if( c2 <= r2 ) {
		newST = magnifyImage(a, b);
		newST = rotateImage(newST, a, b, a1, b1);
		//rgb = texture2D( uTexUnit, newST ).rgb;
		rgb = sharpenImage( texture2D( uTexUnit, newST ).rgb, newST, sizeS, sizeT );
	} else {
		rgb = texture2D( uTexUnit, vST ).rgb;
	}
	//vec2 delta = vST - vec2(uS0,uT0);

	//vec2 st = vec2(uS0,uT0) + sign(delta) * pow( abs(delta), vec2(uPower) );

	//vec3 rgb = texture2D( uTexUnit, vST ).rgb;

	gl_FragColor = vec4( rgb, 1. );
}
