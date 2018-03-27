#version 330 compatibility

uniform float uLightX, uLightY, uLightZ;
uniform float uWaveAmpK;
uniform float uWavePeriodP;
uniform float uNoiseFreq;
uniform float uNoiseAmp;
uniform sampler3D Noise3;

flat out vec3 vNf;
     out vec3 vNs;
flat out vec3 vLf;
     out vec3 vLs;
flat out vec3 vEf;
     out vec3 vEs;

vec3 eyeLightPosition = vec3( uLightX, uLightY, uLightZ );
const float Y0 = 1.;								//top of the curtain -- point of 0 z-displacement
const float PI = 3.14159265359;
vec4 currVertex = gl_Vertex;

float calculateWave(){
	//equation: z = K * (Y0-y) * sin( 2.*PI*x/P )
	return uWaveAmpK * ( Y0 - gl_Vertex.y ) * sin( 2 * PI * gl_Vertex.x / uWavePeriodP );
}

vec3 rotateNormal( float angx, float angy, vec3 n )
{
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

void main() { 
	
	// displace the fragment
	currVertex.z = calculateWave();
	vec3 MCposition = currVertex.xyz;
	
	// find the new normal using tangent vectors
	float dzdx = uWaveAmpK * ( Y0 - currVertex.y ) * ( 2. * PI / uWavePeriodP ) * cos( 2. * PI * currVertex.x / uWavePeriodP );
	float dzdy = -uWaveAmpK * sin( 2. * PI * currVertex.x / uWavePeriodP );
	vec3 Tx = vec3(1., 0., dzdx );
	vec3 Ty = vec3(0., 1., dzdy );
	vec3 currNorm = normalize( cross( Tx, Ty ) );
	
	// adjust normal with noise
	vec4 nvx = texture( Noise3, uNoiseFreq * MCposition );
	float angx = nvx.r + nvx.g + nvx.b + nvx.a - 2.;
	angx *= uNoiseAmp;
    vec4 nvy = texture( Noise3, uNoiseFreq * vec3( MCposition.xy, MCposition.z + 0.5 ) );
	float angy = nvy.r + nvy.g + nvy.b + nvy.a - 2.;
	angy *= uNoiseAmp;
	currNorm = rotateNormal( angx, angy, currNorm );
	
	
	vec4 ECposition = gl_ModelViewMatrix * currVertex;

	vNf = normalize( gl_NormalMatrix * currNorm);//gl_Normal );	// surface normal vector
	vNs = vNf;

	vLf = eyeLightPosition - ECposition.xyz;		// vector from the point
													// to the light position
	vLs = vLf;
	vEf = vec3( 0., 0., 0. ) - ECposition.xyz;		// vector from the point
													// to the eye position 
	vEs = vEf;

	gl_Position = gl_ModelViewProjectionMatrix * currVertex;
}
