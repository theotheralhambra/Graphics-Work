#version 400 compatibility

uniform float uLightX, uLightY, uLightZ;
uniform float uY;
uniform float uNoiseFreq;
uniform float uNoiseAmp;
uniform sampler3D Noise3;

flat out vec3 vNf;
     out vec3 vNs;
flat out vec3 vLf;
     out vec3 vLs;
flat out vec3 vEf;
     out vec3 vEs;
out vec3 vXYZ;
	 
const float PI = 3.14159265359;
vec4 currVertex = gl_Vertex;

vec3 rotateNormal( float angx, float angy, vec3 n ) {
        float cx = cos( angx );
        float sx = sin( angx );
        float cy = cos( angy );
        float sy = sin( angy );

        // rotate about x:
        float yp =  n.y*cx - n.z*sx;    // y'
        n.z      =  n.y*sx + n.z*cx;    // z'
        n.y      =  yp;

        // rotate about y:
        float xp =  n.x*cy + n.z*sy;    // x'
        n.z      = -n.x*sy + n.z*cy;    // z'
        n.x      =  xp;

        return normalize( n );
}

void main()	{
	
	vec3 MCposition = currVertex.xyz;
	vXYZ = currVertex.xyz;
	
	// get the normal
    vec3 currNorm = normalize( gl_NormalMatrix * gl_Normal );
	
	if ( abs(gl_Vertex.y) <  uY) {
		// adjust normal with noise
		vec4 nvx = texture( Noise3, uNoiseFreq * MCposition );
		float angx = nvx.r + nvx.g + nvx.b + nvx.a - 2.;
		angx *= uNoiseAmp;
		vec4 nvy = texture( Noise3, uNoiseFreq * vec3( MCposition.xy, MCposition.z + 0.5 ) );
		float angy = nvy.r + nvy.g + nvy.b + nvy.a - 2.;
		angy *= uNoiseAmp;
		currNorm = rotateNormal( angx, angy, currNorm );
	}
	
	// figure out lighting stuff
	vec3 eyeLightPosition = vec3( uLightX, uLightY, uLightZ );
	vec3 ECposition = vec3( gl_ModelViewMatrix * gl_Vertex );
	
	vNf = normalize( gl_NormalMatrix * currNorm);	// surface normal vector
	vNs = vNf;

	vLf = eyeLightPosition - ECposition.xyz;		// vector from the point
													// to the light position
	vLs = vLf;
	vEf = vec3( 0., 0., 0. ) - ECposition.xyz;		// vector from the point
													// to the eye position 
	vEs = vEf;
	
   	gl_Position = gl_Vertex;
}
