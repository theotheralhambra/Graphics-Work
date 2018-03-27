#version 330 compatibility

in vec4  	vColor;
in vec2  	vST;
in vec3 	N;
in vec3 	L;
in vec3 	E;

uniform vec4 uMaterialColor;
uniform vec4 uLightColor;
uniform vec4 uSpecularColor;
uniform float uKa, uKd, uKs;
uniform float uShininess;

vec4 color = uLightColor * uMaterialColor;

void main() {

	vec3 Normal = normalize(N);
	vec3 Light = normalize(L);
	vec3 Eye = normalize(E);
	
	vec4 ambient = uKa * uLightColor;
	
	float d = max( dot(Normal,Light), 0. );
	vec4 diffuse = uKd * d * uLightColor;

	float s = 0.;
	
	if( dot(Normal,Light) > 0. )		// only do specular if the light can see the point
	{
		vec3 ref = normalize( 2. * Normal * dot(Normal,Light) - Light );
		s = pow( max( dot(Eye,ref),0. ), uShininess );
	}
	vec4 specular = uKs * s * uSpecularColor;

	gl_FragColor = vec4( ambient.rgb + diffuse.rgb + specular.rgb, 1. );

	//gl_FragColor = uMaterialColor;
	//gl_FragColor.rgb *= vLightIntensity;	// apply lighting model
}
