#version 400 compatibility

out vec3 vNormal;

void
main( )
{
	vNormal = normalize( gl_NormalMatrix * gl_Normal );//normalize( gl_Normal );
	gl_Position = gl_Vertex;
}
