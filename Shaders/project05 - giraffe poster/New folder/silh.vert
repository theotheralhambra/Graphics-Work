#version 400 compatibility

void
main( )
{
	gl_Position = gl_ModelViewMatrix * gl_Vertex;
}
