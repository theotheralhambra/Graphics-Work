#version 400 compatibility

flat in vec3 gNf;
     in vec3 gNs;
flat in vec3 gLf;
     in vec3 gLs;
flat in vec3 gEf;
     in vec3 gEs;
	 in vec3 gXYZ;
	 in vec3 gPolygonCenter;

uniform float uKa, uKd, uKs;
uniform vec4 uMaterialBaseColor;
uniform vec4 uMaterialFadeColor;
uniform vec4 uSpecularColor;
uniform float uShininess;
uniform bool uFlat;
uniform float uY;
uniform float uTol;


void main() {
	
	vec3 Normal;
	vec3 Light;
	vec3 Eye;

	if( uFlat && abs(gPolygonCenter.y) < uY + .1) {//gInRange == 1.) {
		Normal = normalize(gNf);
		Light = normalize(gLf);
		Eye = normalize(gEf);
	} else {
		Normal = normalize(gNs);
		Light = normalize(gLs);
		Eye = normalize(gEs);
	}
	
	vec4 thisColor = uMaterialBaseColor;
	//float thisAlpha = 1.;
	
	if( abs(gXYZ.y) > uY-uTol) {
		float blend = smoothstep( uY-uTol, uY+(1.*uTol), abs(gXYZ.y));
		thisColor = mix( uMaterialBaseColor, uMaterialFadeColor, blend );
	}
		
	vec4 ambient = uKa * thisColor;
	
	float d = max( dot(Normal,Light), 0. );
	vec4 diffuse = uKd * d * thisColor;
	
	float s = 0.;
	if( dot(Normal,Light) > 0. ) {											// only do specular if the light can see the point
		vec3 ref = normalize( 2. * Normal * dot(Normal,Light) - Light );
		s = pow( max( dot(Eye,ref),0. ), uShininess );
	}
	vec4 specular = uKs * s * uSpecularColor;
	
	gl_FragColor = vec4( ambient.rgb + diffuse.rgb + specular.rgb, 1. );

}
